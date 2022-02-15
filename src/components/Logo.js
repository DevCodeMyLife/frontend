import React from "react";

function Logo() {
    return (
        <div className="wrapper-logo unselectable">
            <div className="place-logo wrapper-inline-block" onClick={(e) => {
                e.preventDefault();
                window.location.href = '/'
            }}>
                DevCodeMyLife
            </div>
        </div>
    );
}

export default Logo;
