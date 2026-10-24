-- Vault purge plaintext
--
-- Second half of 20261024145712_vault_secure_storage, pushed only after the Flow deploy whose vault reads secrets
-- through flow.vault_reveal. First catches up anything the previous client wrote to metadata in between (new items,
-- changed secrets, changed PINs or passwords), then strips every plain-text secret and access code from
-- flow.vault_items.metadata, deleted rows included. Owns no objects. The catch-up only sees rows the new client never
-- saved, because flow.vault_save_secret drops the metadata copy whenever it saves, so it can't undo a newer edit.

-- @up
-- Items the old client created after secure storage was added.
insert into flow.vault_item_secrets (item_id, secret_id)
select i.id, vault.create_secret(i.metadata->>'secret', 'flow.vault_item.' || i.id, 'Geiger Flow vault item')
from flow.vault_items i
where i.deleted_at is null
  and coalesce(i.metadata->>'secret', '') <> ''
  and not exists (select 1 from flow.vault_item_secrets s where s.item_id = i.id);

do $$
declare
  r record;
  v_code text;
begin
  -- Secrets the old client changed after they were copied into Vault.
  for r in
    select s.secret_id, i.metadata->>'secret' as plain
    from flow.vault_items i
    join flow.vault_item_secrets s on s.item_id = i.id and s.secret_id is not null
    join vault.decrypted_secrets d on d.id = s.secret_id
    where i.deleted_at is null
      and coalesce(i.metadata->>'secret', '') <> ''
      and d.decrypted_secret is distinct from i.metadata->>'secret'
  loop
    perform vault.update_secret(r.secret_id, r.plain);
  end loop;

  -- Secrets added by the old client to items that had none.
  for r in
    select s.item_id, i.metadata->>'secret' as plain
    from flow.vault_items i
    join flow.vault_item_secrets s on s.item_id = i.id and s.secret_id is null
    where i.deleted_at is null and coalesce(i.metadata->>'secret', '') <> ''
  loop
    update flow.vault_item_secrets
    set secret_id = vault.create_secret(r.plain, 'flow.vault_item.' || r.item_id, 'Geiger Flow vault item'),
        updated_at = now()
    where item_id = r.item_id;
  end loop;

  -- PINs and passwords the old client set or changed, hashed under the item's current method.
  for r in
    select i.id, i.access_method, i.metadata->'accessSetup' as setup, s.code_hash, s.code_method
    from flow.vault_items i
    left join flow.vault_item_secrets s on s.item_id = i.id
    where i.deleted_at is null and i.metadata ? 'accessSetup'
  loop
    v_code := case
      when r.setup->>'method' = 'password' then nullif(r.setup->>'password', '')
      when coalesce(r.setup->>'pin', '') ~ '^[0-9]{4,8}$' then r.setup->>'pin'
    end;
    if v_code is not null and (r.code_hash is null or extensions.crypt(v_code, r.code_hash) <> r.code_hash) then
      update flow.vault_items
      set access_method = case when r.setup->>'method' = 'password' then 'password' else 'pin' end
      where id = r.id;
      insert into flow.vault_item_secrets (item_id, code_hash, code_method, updated_at)
      values (
        r.id,
        extensions.crypt(v_code, extensions.gen_salt('bf', 10)),
        case when r.setup->>'method' = 'password' then 'password' else 'pin' end,
        now()
      )
      on conflict (item_id) do update
        set code_hash = excluded.code_hash, code_method = excluded.code_method, updated_at = now();
    end if;
  end loop;
end;
$$;

-- No plain-text secret or access code stays in metadata, on live or deleted rows.
update flow.vault_items
set metadata = metadata - 'secret' - 'accessSetup' - 'accessControl' - 'ttl' - 'keylessEntry' - 'password' - 'apiKey'
where metadata ?| array['secret', 'accessSetup', 'accessControl', 'ttl', 'keylessEntry', 'password', 'apiKey'];

-- @down
-- Puts each live item's secret back into metadata so the previous client can read it again. PINs and passwords are
-- stored only as hashes, so they can't be restored; those items need a new code set from the previous client.
update flow.vault_items i
set metadata = i.metadata || jsonb_build_object('secret', d.decrypted_secret, 'accessSetup', jsonb_build_object('method', i.access_method))
from flow.vault_item_secrets s
join vault.decrypted_secrets d on d.id = s.secret_id
where s.item_id = i.id and i.deleted_at is null;
