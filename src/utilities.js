import { useEffect, useRef } from 'react';

export const getClosestPosition = (clone, rects) => {
    let indexOfClosestRect = null;
    let maxDistance = Infinity;
    const cloneLeft = clone.getBoundingClientRect().left;

    Object.keys(rects).forEach((key, index) => {
        const distance = Math.abs(cloneLeft - rects[key].left);
        if (distance < maxDistance) {
            maxDistance = distance;
            indexOfClosestRect = index;
        }
    });

    return indexOfClosestRect;
}

export const usePrevious = (value) => {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}