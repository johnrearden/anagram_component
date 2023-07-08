import { forwardRef } from 'react';
import './AnagramTile.css';

const AnagramTile = forwardRef(({ letter, id, onPointerDown }, ref) => {

    return (
        <div
            ref={ref}
            id={id}
            className="letter_box"
            onPointerDown={(event) => onPointerDown(event, ref)}>
            {letter}
        </div>
    );
});

export default AnagramTile;
