import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

function App() {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadStories = async () => {
        try {
            const res = await fetch(`/api/stories`);
            setStories(await res.json());
        } catch (error) {
            console.error("Failed to load stories:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStories();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }


    if (import.meta.env.VITE_ENABLE_GAME === "true") {
        return (
            <div>
                <h2>Stories</h2>
                {stories.map((story) => (
                    <div key={story.id}>
                        <h2>{story.title}</h2>
                        <p>{story.description}</p>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <h2>Das Spiel ist vorübergehend nicht aktiv</h2>
    );
}

createRoot(document.getElementById("root")).render(<App />);
