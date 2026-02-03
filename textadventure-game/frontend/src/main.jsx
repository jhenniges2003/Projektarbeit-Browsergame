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

    return (
        <div>
            <h1>Stories</h1>
            {stories.map((story) => (
                <div key={story.id}>
                    <h2>{story.title}</h2>
                    <p>{story.description}</p>
                </div>
            ))}
        </div>
    );
}

createRoot(document.getElementById("root")).render(<App />);
