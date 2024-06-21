import PropTypes from "prop-types";
import { useState, useRef, useEffect, useCallback } from "react";

const VirtualizedGrid = ({
  items,
  renderItem,
  loadMore,
  hasMore,
  isLoading,
  rowGap = 0,
  columnGap = 0,
  minColumnWidth = 250,
  overscan = 0,
}) => {
  const [visibleItems, setVisibleItems] = useState({
    list: [],
    offsetTop: 0,
    offsetBottom: 0,
  });
  const [itemDimensions, setItemDimensions] = useState({ width: 0, height: 0 });

  const gridRef = useRef(null);
  const measureRef = useRef(null);
  const lastElementRef = useRef(null);
  const gridWrapperRef = useRef(null);
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

    const firstElement =
      gridWrapperRef?.current?.lastChild?.getBoundingClientRect();

    const itemElementHeight = firstElement?.height || itemDimensions.height;
    const itemElementWidth = firstElement?.width || itemDimensions.width;

    console.log("itemElementWidth", itemElementWidth);

    const columns = Math.floor(
      (clientWidth + rowGap) / parseInt(itemElementWidth + rowGap) // logic is remain (incomplete)
    );
    const rows =
      Math.ceil(clientHeight / (itemElementHeight + rowGap)) + 2 + 2 * overscan;

    console.log("/////////////////////////", columns);

    const lastPossibleRowIndex = Math.ceil(items.length / columns) - 1;

    const startRowIdx =
      Math.floor(scrollTop / (itemElementHeight + rowGap)) - overscan - 1 < 0
        ? 0
        : Math.floor(scrollTop / (itemElementHeight + rowGap)) - overscan - 1;

    const endRowIdx =
      lastPossibleRowIndex <= startRowIdx + rows - 1
        ? lastPossibleRowIndex
        : startRowIdx + rows - 1;

    console.log("scroll", scrollTop);
    console.log("all idx", startRowIdx, endRowIdx);

    const firstItemIdx = startRowIdx * columns;
    const lastItemIdx = (endRowIdx + 1) * columns - 1;

    const visibleItems = items
      .slice(firstItemIdx, lastItemIdx + 1)
      .map((ele, index) => ({ item: ele, idx: firstItemIdx + index })); // + 1 because slice exclude last index

    setVisibleItems(() => {
      const offsetTop =
        startRowIdx * ((itemElementHeight || itemDimensions.height) + rowGap);
      console.log("===================", offsetTop);
      const offsetBottom =
        (lastPossibleRowIndex - endRowIdx) *
        ((itemElementHeight || itemDimensions.height) + rowGap);
      return {
        list: visibleItems,
        offsetTop,
        offsetBottom,
      };
    });
  }, [itemDimensions.height, itemDimensions.width, items, overscan, rowGap]);

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

  console.log("item dim", visibleItems);

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          zIndex: 99,
          background: "#fff",
          fontSize: "40px",
          transform: "translate(-50%,-50%)",
        }}
      >
        <h1>{visibleItems.list.length}</h1>
      </div>
      <div
        ref={gridRef}
        style={{
          overflowY: "auto",
          height: "100%",
          width: "100%",
          position: "relative",
        }}
        onScroll={handleScroll}
      >
        {items.length > 0 && (
          <div
            style={{
              position: "absolute",
              height: "100%",
              width: "100%",
              visibility: "hidden",
              display: "grid",
              gridTemplateColumns: `repeat(auto-fill, minmax(${minColumnWidth}px, 1fr))`,
              rowGap,
              columnGap,
            }}
          >
            <div ref={measureRef} className="dummyDiv">
              {/* {renderItem(items[0].idx)} */}
              {renderItem(1)}
            </div>
          </div>
        )}
        <div
          style={{
            position: "absolute",
            height: "100%",
            width: "100%",
            top: 0,
          }}
        >
          <div
            ref={gridWrapperRef}
            style={{
              paddingTop: visibleItems.offsetTop,
              paddingBottom: visibleItems.offsetBottom,
              width: "100%",
              height: "100%",
              display: "grid",
              gridTemplateColumns: `repeat(auto-fill, minmax(${minColumnWidth}px, 1fr))`,
              rowGap,
              columnGap,
            }}
          >
            {visibleItems.list.length > 0 &&
              visibleItems.list.map((visibleItem) => (
                <div
                  ref={
                    visibleItem.idx === items.length - 1 ? lastElementRef : null
                  }
                  key={visibleItem.idx}
                >
                  {/* {renderItem(visibleItem.item)} */}
                  {renderItem(visibleItem.idx)}
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

VirtualizedGrid.propTypes = {
  items: PropTypes.array,
  renderItem: PropTypes.func,
  loadMore: PropTypes.func,
  hasMore: PropTypes.bool,
  isLoading: PropTypes.bool,
  rowGap: PropTypes.number,
  columnGap: PropTypes.number,
  minColumnWidth: PropTypes.number,
  overscan: PropTypes.number,
};

export default VirtualizedGrid;
