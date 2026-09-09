import { useEffect, useState } from "react";

export const useItemsPerpage = () => {
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const updateItems = () => {
        const height = window.innerHeight;
        const availableHeight = height - 300;
        const rowHeight = window.innerWidth < 640 ? 90 : 65;
        const calculated = Math.floor(availableHeight / rowHeight);

        setItemsPerPage(calculated > 4 ? calculated : 4);
    };

    useEffect(() => {
        updateItems();

        window.addEventListener("resize", updateItems);

        return () => window.removeEventListener("resize", updateItems);
    }, []);

    return itemsPerPage;
};
