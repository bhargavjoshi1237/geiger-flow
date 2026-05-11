import { loadAddon } from "@/addons/registry";
import { projectPlusAddons } from "./manifest";

projectPlusAddons.forEach(loadAddon);
