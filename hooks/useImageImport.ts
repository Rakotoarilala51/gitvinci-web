"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { calendarColumns } from "../lib/grid";
import {
  DEFAULT_IMAGE_THRESHOLDS,
  sampleImage,
  type ImageThresholds,
} from "../lib/image";

export function useImageImport(year: number) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [invert, setInvert] = useState(false);
  const [thresholds, setThresholds] = useState<ImageThresholds>(
    DEFAULT_IMAGE_THRESHOLDS,
  );
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const request = useRef(0);
  useEffect(
    () => () => {
      request.current++;
    },
    [],
  );

  async function handleFile(file: File) {
    const id = ++request.current;
    setFileName(file.name);
    setLoading(true);
    setError(false);
    setImage(null);
    const url = URL.createObjectURL(file);
    try {
      const next = new Image();
      next.src = url;
      await next.decode();
      if (id === request.current) setImage(next);
    } catch {
      if (id === request.current) setError(true);
    } finally {
      URL.revokeObjectURL(url);
      if (id === request.current) setLoading(false);
    }
  }

  const result = useMemo(() => {
    if (!image) return { preview: null, failed: false };
    try {
      return {
        preview: sampleImage(image, invert, thresholds, calendarColumns(year)),
        failed: false,
      };
    } catch {
      return { preview: null, failed: true };
    }
  }, [image, invert, thresholds, year]);
  return {
    preview: result.preview,
    fileName,
    invert,
    thresholds,
    fileRef,
    handleFile,
    setInvert,
    setThresholds,
    error: error || result.failed,
    loading,
  };
}
