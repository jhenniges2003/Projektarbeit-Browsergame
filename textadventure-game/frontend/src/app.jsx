import Router from "./Routes";
import { useEffect } from "react";

export default function App() {
     useEffect(() => {
        if (window.bootstrap) {
            const tooltipTriggerList = document.querySelectorAll(
                '[data-bs-toggle="tooltip"]'
            );

            tooltipTriggerList.forEach((element) => {
                if (!element._tooltip) {
                    element._tooltip = new window.bootstrap.Tooltip(element);
                }
            });
        }
    }, []);

    return <Router />
}