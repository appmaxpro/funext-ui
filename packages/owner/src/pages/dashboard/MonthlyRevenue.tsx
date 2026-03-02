import * as React from 'react';
import DollarIcon from '@funext/icons/AttachMoney';

import CardWithIcon from './CardWithIcon';

interface Props {
    value?: string;
}

const MonthlyRevenue = (props: Props) => {
    const { value } = props;
    return (
        <CardWithIcon
            to="states"
            icon={DollarIcon}
            title={"Monthly Revenue"}
            subtitle={value}
        />
    );
};

export default MonthlyRevenue;