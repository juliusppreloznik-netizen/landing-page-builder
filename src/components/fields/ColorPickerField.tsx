"use client";

import { useState, useRef, useEffect } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";

type ColorPickerFieldProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
};

export function ColorPickerField({ value, onChange, label }: ColorPickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const color = value || "#000000";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div style={{ position: "relative" }}>
      {label && (
        <div style={{ fontSize: "12px", color: "#CCCCCC", marginBottom: "4px" }}>
          {label}
        </div>
      )}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "#1A1A1A",
          border: "1px solid #2A2A2A",
          borderRadius: "6px",
          padding: "0 8px",
          height: "28px",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "3px",
            backgroundColor: color,
            border: "1px solid #444",
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: "12px", color: "#FFFFFF" }}>{color}</span>
      </div>

      {isOpen && (
        <div
          ref={popoverRef}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            zIndex: 1000,
            marginTop: "4px",
            background: "#1A1A1A",
            border: "1px solid #333",
            borderRadius: "8px",
            padding: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            width: "220px",
          }}
        >
          <HexColorPicker
            color={color}
            onChange={onChange}
            style={{ width: "100%", height: "160px" }}
          />
          <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "4px",
                backgroundColor: color,
                border: "1px solid #444",
                flexShrink: 0,
              }}
            />
            <HexColorInput
              color={color}
              onChange={onChange}
              prefixed
              style={{
                flex: 1,
                background: "#0D0D0D",
                border: "1px solid #333",
                borderRadius: "4px",
                color: "#FFFFFF",
                fontSize: "12px",
                padding: "4px 8px",
                height: "28px",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
