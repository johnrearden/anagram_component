import './AnagramPuzzle.css';
import { useLayoutEffect, useState, createRef, useRef } from 'react';
import { usePrevious } from './utilities';
import AnagramTile from './AnagramTile';
import { getClosestPosition } from './utilities';

const ANIMATION_DURATION = 400;

export const AnagramPuzzle = ({ letters }) => {

    // State, triggering re-renders
    const [letterOrder, setLetterOrder] = useState(() => {
        return letters.map((unused, index) => index);
    });
    const previousLetterOrder = usePrevious(letterOrder);

    // Refs, keeping track of DOM nodes and their bounding rects
    const domRefs = useRef([]);
    const draggedTileRef = useRef(null);
    const containerRef = useRef(null);

    const boundingRects = useRef([]);
    const pointerData = useRef({});


    useLayoutEffect(() => {
        const rects = {};
        domRefs.current.forEach((ref, index) => {
            const node = ref.current;
            rects[index] = node.getBoundingClientRect();
        });
        boundingRects.current = rects;
    }, []);


    useLayoutEffect(() => {
        if (!previousLetterOrder) {
            return;
        }
        letterOrder.forEach((item, index) => {
            
            const hasMoved = item !== previousLetterOrder[index];
            
            if (hasMoved) {
                const domNode = domRefs.current[item].current;
                const currentRect = boundingRects.current[index];
                const previousPosition = previousLetterOrder.indexOf(item);
                const previousRect = boundingRects.current[previousPosition];

                const deltaX = previousRect.left - currentRect.left;
                if (deltaX) {
                    // Move to the old position, without animating, on the next frame.
                    requestAnimationFrame(() => {
                        domNode.style.transform = `translateX(${deltaX}px)`;
                        domNode.style.transition = 'transform 0s';

                        // Animate back to the new position on the subsequent frame.
                        requestAnimationFrame(() => {
                            domNode.style.transform = '';
                            domNode.style.transition = `transform ${ANIMATION_DURATION}ms`;
                        });
                    });
                }
            }
        });
    }, [letterOrder, previousLetterOrder]);


    const onPointerDown = (event, letterRef) => {
        const scrollTopOffset = document.documentElement.scrollTop;
        const scrollLeftOffset = document.documentElement.scrollLeft;

        const draggedTile = letterRef.current;
        const clone = draggedTile.cloneNode(true);
        draggedTile.classList.add('dragged_letter_box');
        draggedTileRef.current = draggedTile;

        clone.classList.add('clone');
        const margin = window.getComputedStyle(letterRef.current).margin.replace('px', '');
        clone.style.left = `${letterRef.current.getBoundingClientRect().left + scrollLeftOffset - margin}px`;
        clone.style.top = `${letterRef.current.getBoundingClientRect().top + scrollTopOffset - margin}px`;
        containerRef.current.appendChild(clone);

        pointerData.current = {
            clone: clone,
            offsetX: event.clientX - letterRef.current.getBoundingClientRect().left,
            offsetY: event.clientY - letterRef.current.getBoundingClientRect().top,
            mouseX: event.clientX,
            mouseY: event.clientY,
        }
    }


    const onPointerMove = (event) => {
        if (!pointerData.current.clone) {
            return;
        }
        const data = pointerData.current;
        const clone = data.clone;
        const draggedNodeId = parseInt(draggedTileRef.current.id);
        const closestPosition = getClosestPosition(clone, boundingRects.current);

        if (closestPosition !== letterOrder.indexOf(draggedNodeId)) {
            const newOrder = [...letterOrder];
            const dragged = letterOrder.indexOf(draggedNodeId);
            [newOrder[closestPosition], newOrder[dragged]] = [newOrder[dragged], newOrder[closestPosition]];
            setLetterOrder(newOrder);
        }

        if (clone) {
            clone.style.left = `${event.clientX - data.offsetX}px`;
            clone.style.top = `${event.clientY - data.offsetY}px`;
            pointerData.current = {
                ...data,
                mouseX: event.clientX,
                mouseY: event.clientY,
            };
            
        }
    }


    const handleDragStop = (event) => {
        const data = pointerData.current;
        const clone = data.clone;
        const draggedTile = draggedTileRef.current;
        if (clone && draggedTile) {
            const cloneLeft = clone.getBoundingClientRect().left;
            const cloneTop = clone.getBoundingClientRect().top;
            clone.remove();
            draggedTile.classList.remove('dragged_letter_box');
            draggedTileRef.current = null;
            pointerData.current = {
                ...data,
                clone: null,
            };
            const draggedTilePosition = letterOrder.indexOf(parseInt(draggedTile.id));
            const draggedTileRect = boundingRects.current[draggedTilePosition];
            const deltaX = cloneLeft - draggedTileRect.left;
            const deltaY = cloneTop - draggedTileRect.top;
            requestAnimationFrame(() => {
                draggedTile.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                draggedTile.style.transition = `transform 0s`;
                requestAnimationFrame(() => {
                    draggedTile.style.transform = '';
                    draggedTile.style.transition = `transform ${ANIMATION_DURATION * 0.25}ms`;
                });
            });

        }

    }

    console.log('rendering');

    const anagramTiles = letterOrder.map((index) => {
        const ref = createRef()
        domRefs.current[index] = ref;
        return (
            <AnagramTile
                key={`tile-${index}`}
                letter={letters[index]}
                ref={ref}
                id={index}
                onPointerDown={onPointerDown}
            />
        );
    });

    return (
        <div
            className="outer_container"
            onPointerLeave={handleDragStop}
            onPointerMove={onPointerMove}
            onPointerUp={handleDragStop}
        >
            <div
                ref={containerRef}
                className="anagram_holder"
            >
                {anagramTiles}
            </div>
        </div>
    )
}

