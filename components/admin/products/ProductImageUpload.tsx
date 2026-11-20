
"use client";

import { useEffect, useMemo } from "react";
import { getImageUrl } from "@/app/lib/imageUrl";
import {
  FiImage,
  FiUpload,
  FiX,
  FiStar,
} from "react-icons/fi";

import type { ProductImageResponse } from "@/app/types/products";

interface ProductImageUploadProps {
  files: File[];
  existingImages?: ProductImageResponse[];
  disabled?: boolean;
  settingPrimaryImageId?: number | null;
  deletingImageId?: number | null;
  onChange: (files: File[]) => void;
  onSetPrimary?: (
    image: ProductImageResponse
  ) => void | Promise<void>;
  onDeleteExisting?: (image: ProductImageResponse) => void;
}

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function ProductImageUpload({
  files,
  existingImages = [],
  disabled = false,
  settingPrimaryImageId = null,
  deletingImageId = null,
  onChange,
  onSetPrimary,
  onDeleteExisting,
}: ProductImageUploadProps) {
  const previews = useMemo(
    () =>
      files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    [files]
  );

  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [previews]);

  const totalImages = existingImages.length + files.length;
  const remainingSlots = Math.max(0, MAX_IMAGES - totalImages);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(
      event.target.files ?? []
    );

    const validFiles: File[] = [];

    for (const file of selectedFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        window.alert(
          `${file.name} is not supported. Use JPEG, PNG or WebP.`
        );
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        window.alert(
          `${file.name} exceeds the 5 MB file size limit.`
        );
        continue;
      }

      validFiles.push(file);
    }

    const availableSlots = Math.max(
      0,
      MAX_IMAGES - existingImages.length - files.length
    );

    if (validFiles.length > availableSlots) {
      window.alert(
        `You can add only ${availableSlots} more image(s). A product can have a maximum of ${MAX_IMAGES} images.`
      );
    }

    onChange([
      ...files,
      ...validFiles.slice(0, availableSlots),
    ]);

    event.target.value = "";
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="col-12">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="form-label fw-medium mb-0">
          Product Images
        </label>

        <span className="text-secondary small">
          {totalImages}/{MAX_IMAGES} images
        </span>
      </div>

      <div className="border rounded-3 p-3">
        <div className="product-image-grid">

        {/* Existing images */}
{existingImages.map((image) => {
  const isSettingPrimary = settingPrimaryImageId === image.id;
  const isDeleting = deletingImageId === image.id;

  return (
    <div key={image.id} className="product-image-item">

      {/* Image container */}
      <div className="ratio ratio-1x1 position-relative">
        <img
          src={getImageUrl(image.url)}
          alt="Product"
          className="rounded-2 border object-fit-cover w-100 h-100"
        />

        {/* Delete image */}
        <button
          type="button"
          className="btn btn-danger btn-sm rounded-circle position-absolute top-0 end-0 translate-middle d-flex align-items-center justify-content-center product-image-remove"
          onClick={() => onDeleteExisting?.(image)}
          disabled={
            disabled ||
            isDeleting ||
            isSettingPrimary ||
            !onDeleteExisting
          }
          aria-label="Delete product image"
          title="Delete image"
        >
          {isDeleting ? (
            <span className="spinner-border spinner-border-sm" />
          ) : (
            <FiX size={14} />
          )}
        </button>
      </div>

      {/* Primary badge BELOW the image */}
      {image.primary ? (
        <div className="mt-2">
          <span className="badge bg-success w-100 py-2">
            Primary Image
          </span>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-light btn-sm border w-100 mt-2 d-flex align-items-center justify-content-center gap-1"
          onClick={() => onSetPrimary?.(image)}
          disabled={
            disabled ||
            isSettingPrimary ||
            isDeleting ||
            !onSetPrimary
          }
          title="Set as primary image"
        >
          {isSettingPrimary ? (
            <span className="spinner-border spinner-border-sm" />
          ) : (
            <>
              <FiStar size={13} />
              <span>Set primary</span>
            </>
          )}
        </button>
      )}
    </div>
  );
})}
          {/* Newly selected images */}
          {previews.map((preview, index) => (
            <div
              key={`${preview.file.name}-${index}`}
              className="product-image-item"
            >
              <div className="ratio ratio-1x1 position-relative">
                <img
                  src={preview.url}
                  alt={preview.file.name}
                  className="rounded-2 border object-fit-cover w-100 h-100"
                />

                <button
                  type="button"
                  className="btn btn-danger btn-sm rounded-circle position-absolute top-0 end-0 translate-middle d-flex align-items-center justify-content-center product-image-remove"
                  onClick={() => removeFile(index)}
                  disabled={disabled}
                  aria-label={`Remove ${preview.file.name}`}
                >
                  <FiX size={14} />
                </button>
              </div>

              <span className="small text-secondary d-block text-truncate mt-1">
                {preview.file.name}
              </span>
            </div>
          ))}

          {totalImages === 0 && (
            <div
              className="text-center py-4 text-secondary"
              style={{ gridColumn: "1 / -1" }}
            >
              <FiImage size={30} className="mb-2" />

              <p className="mb-0 small">
                No product images selected.
              </p>
            </div>
          )}
        </div>

        {/* Choose images */}
        {remainingSlots > 0 && (
          <label
            className={`d-flex align-items-center justify-content-center gap-2 border border-2 border-dashed rounded-3 p-3 mt-3 ${
              disabled ? "opacity-50" : ""
            }`}
            style={{ cursor: disabled ? "not-allowed" : "pointer" }}
          >
            <FiUpload size={18} />

            <span className="small fw-medium">
              Choose Images
            </span>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              hidden
              disabled={disabled}
              onChange={handleFileChange}
            />
          </label>
        )}

        <p className="text-secondary small mt-2 mb-0">
          JPEG, PNG or WebP. Maximum 5 MB per image.
          You can upload up to 10 images per product.
        </p>
      </div>
    </div>
  );
}
