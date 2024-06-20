import VirtualizedGrid from "./components/VirtualizedGrid";
import "./App.css";
import { useEffect, useRef, useState } from "react";

const LIMIT = 5;

const App = () => {
  const [items, setItems] = useState({
    itemsList: [],
    isLoading: true,
    hasMore: true,
  });
  const { itemsList, isLoading, hasMore } = items;
  const countRef = useRef(LIMIT);

  const loadMore = () => {
    if (isLoading || !hasMore) {
      return;
    }
    setItems((prev) => ({
      ...prev,
      isLoading: true,
    }));
    setTimeout(() => {
      const newArr = Array.from({ length: LIMIT }, (_, index) => ({
        id: index + countRef.current,
      }));
      setItems((prev) => ({
        ...prev,
        isLoading: false,
        hasMore: prev.itemsList.length < 60,
        itemsList: [...prev.itemsList, ...newArr],
      }));
      countRef.current += LIMIT;
    }, [2000]);
  };

  const renderItem = (item) => {
    return (
      <div style={{ padding: "20px", border: "1px solid #ccc" }}>{item}</div>
    );
  };

  const gridStyles = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "10px",
    padding: "10px",
  };

  useEffect(() => {
    setTimeout(() => {
      setItems((prev) => ({
        ...prev,
        itemsList: Array.from({ length: LIMIT }, (_, index) => ({
          id: index,
        })),
        hasMore: true,
        isLoading: false,
      }));
    }, [2000]);
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <VirtualizedGrid
        items={itemsList}
        renderItem={renderItem}
        gridStyles={gridStyles}
        loadMore={loadMore}
        hasMore={hasMore}
        isLoading={isLoading}
      />
    </div>
  );
};

export default App;
