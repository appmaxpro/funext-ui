import * as React from 'react';
import ShoppingCartIcon from '@funext/icons/ShoppingCart';

import CardWithIcon from './CardWithIcon';

interface Props {
    value?: number;
}

const NbNewOrders = (props: Props) => {
    const { value } = props;
    return (
        <CardWithIcon
            to="/orders"
            icon={ShoppingCartIcon}
            title={'New Orders'}
            subtitle={value}
        />
    );
};

export default NbNewOrders;