import React from "react";
import './ChangeWeek.css'
import {ReactComponent as Arrow} from './arrow_forward_ios-24px.svg'

const ChangeWeek = props => {
    const {week, forward, back} = props;

    return <div className="change-week change-week__container">
        <Arrow id="change-week--back"
               className="change-week change-week__button change-week__button--back"
               onClick={back}
        />
        <span id="change-week--week"
             className="change-week change-week__week">
            {`${week}`}
        </span>
        <Arrow id="change-week--forward"
               onClick={forward}
               className="change-week change-week__button"
        />
    </div>
}

export default ChangeWeek
