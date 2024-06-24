import VirtualizedGrid from "./components/VirtualizedGrid";
import "./App.css";
import { useEffect, useRef, useState } from "react";
import GridItem from "./components/GridItem";

const LIMIT = 25;

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
    <div className="grid-wrapper">
      <VirtualizedGrid
        items={itemsList}
        renderItem={GridItem}
        loadMore={loadMore}
        hasMore={hasMore}
        isLoading={isLoading}
        rowGap={20}
        columnGap={20}
        minColumnWidth={250}
        overscan={1}
      />
    </div>
  );
};

export default App;
