import React from "react";

function Error(event) {
  return (
    <div>
        {/*<div style={{"background": "#FF9898"}} className="title-page">*/}
        {/*  Ошибка*/}
        {/*</div>*/}
        <div className="error-wrapper">
            <div className="error-page">
              Страницы <b>{event.page}</b> не существует, либо еще не создана.
            </div>
        </div>
    </div>
  );
}

export default Error;
