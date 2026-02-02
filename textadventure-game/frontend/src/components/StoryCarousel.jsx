import { useMemo, useState } from "react";

export default function StoryCarousel({
    slides = [],
    height = 420,
    onStart,
    disabled = false,
}) {
    const [index, setIndex] = useState(0);

    const safeSlides = useMemo(() => (slides.length ? slides : []), [slides]);
    const active = safeSlides[index];

    const hasMultiple = safeSlides.length > 1;

    const goPrevious = () => setIndex((index) => (index - 1 + safeSlides.length) % safeSlides.length);
    const goNext = () => setIndex((index) => (index + 1) % safeSlides.length);

    if (!safeSlides.length) {
        return (
            <section
                className="border rounded flex-grow-1 mb-3 d-flex align-items-center justify-content-center text-muted"
            >
                Keine Stories vorhanden
            </section>
        );
    }

    return (
        <section
            className="border rounded position-relative overflow-hidden mb-3"
            style={{ height }}
        >
            <div 
                className="w-100 h-100"
                style={{
                    backgroundImage: `url(${active.backgroundImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "none",
                }}
            />

            <div
                className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            >
                <div className="text-center px-3">
                    <h2
                        className="mb-3"
                        style={{
                            color: "white",
                            textShadow: "0 2px 8px rgba(0,0,0,0.5",
                        }}
                    >
                        {active.title}
                    </h2>

                    <button
                        type="button"
                        className="btn btn-light px-4"
                        disabled={disabled}
                        onClick={() => onStart?.(active, index)}>
                        {active.buttonLabel ?? "START"}
                    </button>
                </div>
            </div>

            {hasMultiple && (
                <button
                    type="button"
                    aria-label="Vorherige Story"
                    onClick={goPrev}
                    className="btn btn-light position-absolute top-50 start-0 translate-middle-y ms-3 rounded-circle"
                    style={{ width: 42, height: 42, opacity: 0.9 }}
                >
                    ‹
                </button>
            )}

            {hasMultiple && (
                <button
                    type="button"
                    aria-label="Nächste Story"
                    onClick={goNext}
                    className="btn btn-light position-absolute top-50 end-0 translate-middle-y me-3 rounded-circle"
                    style={{ width: 42, height: 42, opacity: 0.9 }}
                >
                    ›
                </button>
            )}

            {hasMultiple && (
                <div className="position-absolute bottom-0 start-0 w-100 d-flex justify-content-center gap-2 pb-3">
                    {safeSlides.map((_, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => setIndex(i)}
                        aria-label={`Gehe zu Story ${i + 1}`}
                        style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        border: "none",
                        background:
                            i === index ? "white" : "rgba(255,255,255,0.5)",
                        }}
                    />
                    ))}
                </div>
            )}
        </section>
    )
}