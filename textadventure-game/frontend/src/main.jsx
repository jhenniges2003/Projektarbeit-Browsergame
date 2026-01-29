import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

function App() {
    const [scene, setScene] = useState(null);

    const loadScene = async (id) => {
        const res = await fetch(`/api/scenes/${id}`);
        setScene(await res.json());
    };

    useEffect(() => {
        loadScene("start");
    }, []);

    if (!scene) return <p>Lade...</p>;

    return (
        <div style={{ maxWidth: 600, margin: "40px auto" }}>
            <p>{scene.text}</p>

            {scene.choices.map((c, i) => (
                <button
                    key={i}
                    onClick={() => loadScene(c.next)}
                    style={{ display: "block", margin: "8px 0" }}
                >
                    {c.text}
                </button>
            ))}
        </div>
    );
}

createRoot(document.getElementById("root")).render(<App />);
