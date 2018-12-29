import React from "react";

export const HoverDebugger = ({ hoverResult }) => {
    const entries = Object.entries(hoverResult);
    const liElements = entries.map(kv => {
        let value = "";

        if (kv.length > 1 && kv[1]) {
            value = kv[1].outerHTML ? kv[1].outerHTML : kv[1];
        }

        return (
            <li key={kv[0]}>
                <strong>{kv[0]}</strong>
                {value}
            </li>
        );
    });

    return (
        <div className="hover-debugger">
            <ul>{liElements}</ul>
        </div>
    );
};
