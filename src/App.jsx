import VirtualizedGrid from "./components/VirtualizedGrid";
import "./App.css";
import { useEffect, useRef, useState } from "react";

const LIMIT = 250;

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
        hasMore: prev.itemsList.length < 250,
        itemsList: [...prev.itemsList, ...newArr],
      }));
      countRef.current += LIMIT;
    }, [2000]);
  };

  const renderItem = (item) => {
    return (
      <div>
        <div
          className="image-wrapper"
          style={{ width: "100%", aspectRatio: "1/1", display: "flex" }}
        >
          <img
            src={`https://picsum.photos/id/${item}/200/300`}
            style={{ height: "100%", width: "100%", objectFit: "cover" }}
            alt="Element-Image"
          />
        </div>
      </div>
    );
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
    <div style={{ height: "100vh", width: "100%", padding: "50px" }}>
      <VirtualizedGrid
        items={itemsList}
        renderItem={renderItem}
        loadMore={loadMore}
        hasMore={hasMore}
        isLoading={isLoading}
        rowGap={20}
        columnGap={200}
        minColumnWidth={250}
        overscan={0}
      />
    </div>
  );
};

export default App;
