import PropTypes from "prop-types";
import { useState, useRef, useEffect, useCallback } from "react";

const VirtualizedGrid = ({
  items,
  renderItem,
  gridStyles,
  loadMore,
  hasMore,
  isLoading,
}) => {
  const [visibleItems, setVisibleItems] = useState({
    list: [],
    offsetTop: 0,
    offsetBottom: 0,
    lastRowIndex: 0,
  });
  const [itemDimensions, setItemDimensions] = useState({ width: 0, height: 0 });
  const gridRef = useRef(null);
  const measureRef = useRef(null);
  const lastElementRef = useRef(null);
  const timeoutRef = useRef(null);

  const measureItemDimensions = () => {
    if (!measureRef.current) {
      return;
    }
    const { width, height } = measureRef.current.getBoundingClientRect();
    setItemDimensions({ width, height });
  };

  const calculateVisibleItems = useCallback(() => {
    const { scrollTop, clientHeight, clientWidth } = gridRef.current;

    if (itemDimensions.height === 0 || itemDimensions.width === 0) {
      return;
    }

    const columns = Math.ceil(clientWidth / itemDimensions.width);
    const rows = Math.ceil(clientHeight / itemDimensions.height) + 1;

    const lastPossibleRowIndex = Math.ceil(items.length / columns) - 1;

    const startRowIdx =
      Math.floor(scrollTop / itemDimensions.height) - 1 < 0
        ? 0
        : Math.floor(scrollTop / itemDimensions.height) - 1;

    const endRowIdx =
      Math.ceil(items.length / columns) <= startRowIdx + rows
        ? Math.ceil(items.length / columns)
        : startRowIdx + rows;

    const firstItemIdx = startRowIdx * columns;
    const lastItemIdx = (endRowIdx + 1) * columns - 1;

    const visibleItems = items.slice(firstItemIdx, lastItemIdx + 1); // + 1 because slice exclude last index

    setVisibleItems((prevVisibleItems) => {
      const offsetTop =
        startRowIdx * itemDimensions.height + parseInt(gridStyles.padding);
      const lastRowIndex =
        prevVisibleItems.lastRowIndex < endRowIdx
          ? endRowIdx
          : prevVisibleItems.lastRowIndex;
      const offsetBottom =
        (lastPossibleRowIndex - endRowIdx) * itemDimensions.height +
        parseInt(gridStyles.padding);
      return {
        list: visibleItems,
        offsetTop,
        offsetBottom,
        lastRowIndex,
      };
    });
  }, [gridStyles.padding, itemDimensions.height, itemDimensions.width, items]);

  const handleScroll = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (isLoading && !hasMore) {
      return;
    }
    timeoutRef.current = setTimeout(() => {
      calculateVisibleItems();
    }, 100);
  };

  useEffect(() => {
    if (isLoading && !hasMore) {
      return;
    }
    if (lastElementRef && lastElementRef.current) {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      });
      const element = lastElementRef.current;
      observer.observe(element);

      return () => {
        if (element) observer.unobserve(element);
      };
    }
  }, [hasMore, isLoading, loadMore, visibleItems]);

  useEffect(() => {
    measureItemDimensions();
    window.addEventListener("resize", measureItemDimensions);
    window.addEventListener("resize", calculateVisibleItems);
    return () => {
      window.removeEventListener("resize", measureItemDimensions);
      window.removeEventListener("resize", calculateVisibleItems);
    };
  }, [calculateVisibleItems]);

  useEffect(() => {
    calculateVisibleItems();
  }, [calculateVisibleItems, itemDimensions]);

  return (
    <>
      {items.length > 0 && (
        <div
          style={{
            position: "absolute",
            height: "auto",
            width: "100%",
            visibility: "hidden",
            ...gridStyles,
          }}
        >
          <div ref={measureRef} className="dummyDiv">
            {renderItem(items[0].id)}
          </div>
        </div>
      )}

      <div
        ref={gridRef}
        style={{
          overflowY: "auto",
          height: "100%",
          width: "100%",
        }}
        onScroll={handleScroll}
      >
        <div
          style={{
            ...gridStyles,
            gridAutoRows: `${itemDimensions.height}px`,
            paddingTop: visibleItems.offsetTop,
            paddingBottom: visibleItems.offsetBottom,
            width: "100%",
            height: "100%",
          }}
        >
          {visibleItems.list.length > 0 &&
            visibleItems.list.map((item) => (
              <div
                ref={item.id === items.at(-1).id ? lastElementRef : null}
                key={item.id}
              >
                {renderItem(item.id)}
              </div>
            ))}
          {isLoading &&
            hasMore &&
            Array.from({ length: 5 }, (_, idx) => idx).map((_, index) => (
              <div key={index} style={{ background: "#F1F1F1" }} />
            ))}
        </div>
      </div>
    </>
  );
};

VirtualizedGrid.propTypes = {
  items: PropTypes.array,
  renderItem: PropTypes.func,
  gridStyles: PropTypes.object,
  loadMore: PropTypes.func,
};

export default VirtualizedGrid;
