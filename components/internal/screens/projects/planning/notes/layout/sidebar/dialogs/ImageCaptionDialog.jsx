import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@geiger/ui";
import { Input } from "@geiger/ui";
import { Label } from "@geiger/ui";
import { Button } from "@geiger/ui";
import { Slider } from "@geiger/ui";
import ColorPicker from "../../../edges/ColorePicker";

const ImageCaptionDialog = ({ open, onOpenChange, initialData, onSave }) => {
  const [caption, setCaption] = useState("");
  const [opacity, setOpacity] = useState(1);
  const [bgColor, setBgColor] = useState("#1e1e1e");
  const [textColor, setTextColor] = useState("#ffffff");

  useEffect(() => {
    if (initialData) {
      setCaption(initialData.text || "");
      setOpacity(
        initialData.bgOpacity !== undefined ? initialData.bgOpacity : 1,
      );
      setBgColor(initialData.bgColor || "#1e1e1e");
      setTextColor(initialData.textColor || "#ffffff");
    }
  }, [initialData, open]);

  const handleSave = () => {
    onSave({
      text: caption,
      bgOpacity: opacity,
      bgColor,
      textColor,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-surface-dialog border-border text-foreground">
        <DialogHeader>
          <DialogTitle>Edit Caption</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="caption" className="text-foreground">
              Caption Text
            </Label>
            <Input
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="bg-surface-card border-border-strong text-foreground focus:ring-ring focus:border-zinc-600"
              placeholder="Enter caption..."
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-foreground">
              Background Opacity: {Math.round(opacity * 100)}%
            </Label>
            <Slider
              value={[opacity]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={(vals) => setOpacity(vals[0])}
              className="py-4"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-foreground">Background Color</Label>
              <ColorPicker
                value={bgColor}
                onChange={setBgColor}
                side="top"
                align="start"
              >
                <Button
                  className="w-full h-10 rounded border border-border-strong flex items-center justify-center gap-2 hover:border-zinc-500 transition-colors"
                  style={{ backgroundColor: bgColor }}
                >
                </Button>
              </ColorPicker>
            </div>
            <div className="grid gap-2">
              <Label className="text-foreground">Text Color</Label>
              <ColorPicker
                value={textColor}
                onChange={setTextColor}
                side="top"
                align="start"
              >
                <Button
                  className="w-full h-10 rounded border border-border-strong flex items-center justify-center gap-2 hover:border-zinc-500 transition-colors"
                  style={{ backgroundColor: textColor }}
                />
              </ColorPicker>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border-strong text-foreground hover:bg-surface-card hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCaptionDialog;
