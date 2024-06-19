import { useState, useRef, useEffect, useCallback } from "react";

const VirtualizedGrid = ({ items, renderItem, gridStyles }) => {
	const [visibleItems, setVisibleItems] = useState([]);
	const [itemDimensions, setItemDimensions] = useState({ width: 0, height: 0 });
	const gridRef = useRef(null);
	const measureRef = useRef(null);

	const measureItemDimensions = () => {
		const { width, height } = measureRef.current.getBoundingClientRect();
		setItemDimensions({ width, height });
		console.log("first", width, height);
	};

	const calculateVisibleItems = useCallback(() => {
		const { scrollTop, clientHeight, clientWidth } = gridRef.current;

		console.log("first", scrollTop, clientHeight, clientWidth);

		if (itemDimensions.height === 0 || itemDimensions.width === 0) {
			return;
		}

		const columns = Math.floor(clientWidth / itemDimensions.width);
		const rows = Math.ceil(clientHeight / itemDimensions.height);
		console.log("rows", rows);
		console.log("columns", columns);
		const startRow = Math.floor(scrollTop / itemDimensions.height);

		const firstItemIdx = startRow * columns;
		const lastItemIdx = firstItemIdx + rows * columns;
		console.log("=============", firstItemIdx, lastItemIdx);
		const visibleItems = items.slice(firstItemIdx, lastItemIdx);
		console.log("sorted", visibleItems);
		setVisibleItems(visibleItems);
	}, [itemDimensions.height, itemDimensions.width, items]);

	const handleScroll = () => {
		calculateVisibleItems();
	};

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
					{renderItem(items[0])}
				</div>
			</div>
			<div
				ref={gridRef}
				style={{
					overflowY: "auto",
					height: "100%",
					...gridStyles,
					gridAutoRows: `${itemDimensions.height}px`,
				}}
				onScroll={handleScroll}
			>
				{/* <div
					style={{
						// display: "grid",
						...gridStyles,
						// gridAutoRows: `minmax(${itemDimensions.height}px, auto)`,
					}}
				> */}
				{visibleItems.length > 0 &&
					visibleItems.map((item, index) => (
						<div key={index}>{renderItem(item)}</div>
					))}
				{/* </div> */}
			</div>
		</>
	);
};

export default VirtualizedGrid;
