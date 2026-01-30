import { useEffect } from "react"

export default function Alert({
    open, onClose, title, message, severity = "danger", duration = 4000
}) {
    useEffect(() => {
        if(!open) return;
        const time = setTimeout(() => onClose?.(), duration);
        return () => clearTimeout(time);
    }, [open, duration, onClose]);

    if (!open) return null;

    return (
        <div 
            style={{
                position: "fixed",
                top: 16,
                right: 16,
                zIndex: 1080,
                minWidth: 280,
                maxWidth: 420,
            }}
            role="alert"
            arial-live="assertive"
            aria-atomic="true"
        >
            <div className={`alert alert-${severity} alert-dismissible fade show shadow`} role="alert">
                {title && (
                    <div className="d-flex align-items-center mb-1">
                        <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-2"
                        style={{
                            width: 28,
                            height: 28,
                            backgroundColor: "rgba(0,0,0,0.15)",
                            fontWeight: "bold",
                            flexShrink: 0,
                        }}
                        >
                        !
                        </div>
                        <div className="fw-semibold">{title}</div>
                    </div>
                )}

                <div>{ message }</div>
                
                <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={onClose}
                />
            </div>
        </div>
    )
}