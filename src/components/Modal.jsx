import { useEffect, useRef } from "react";
import "../styles/modal.css";

function Modal({ isOpen, onClose, children }) {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement;

    const dialog = dialogRef.current;

    const focusableSelector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");

    const focusFirstElement = () => {
      const elements = dialog?.querySelectorAll(focusableSelector);
      const first = elements?.[0];

      if (first) {
        first.focus();
      } else {
        dialog?.focus();
      }
    };

    const frame = requestAnimationFrame(focusFirstElement);

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key !== "Tab" || !dialog) return;

      const elements = Array.from(
        dialog.querySelectorAll(focusableSelector)
      ).filter((element) => element.getClientRects().length > 0);

      if (elements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);

      const previous = previousFocusRef.current;

      if (previous && typeof previous.focus === "function") {
        previous.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        className="modal"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Janela de diálogo"
        tabIndex={-1}
      >
        <button
          className="close-button"
          type="button"
          onClick={onClose}
          aria-label="Fechar janela"
          title="Fechar janela"
        >
          <span aria-hidden="true">✖</span>
        </button>

        {children}
      </div>
    </div>
  );
}

export default Modal;
