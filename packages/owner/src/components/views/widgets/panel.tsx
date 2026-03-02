import {useCallback, useMemo} from 'react';

import { EMPTY_ARRAY, i18n, type Block, type FormView, type LayoutWidget, type SchemaBlock } from '~/utils';
import { Divider, Flex, Grid } from '@funext/ui';

export const PanelComponent = ({
  item,
  renderItem,
}: {
  item: SchemaBlock<LayoutWidget>;
  renderItem: (block: Block) => React.JSX.Element;
}) => {
  
  const items = item.items;
  const content = useMemo(() => !items ? [] : Array.isArray(items) ? items : [items], [items]) as Block[];
  
  const Comp = item.type === 'grid' ? Grid : Flex;
  const props = item.props;


  const Wrapper = useCallback(
    ({
      children,
    }: {
      children: any;
    }) => {
      return (
        <Comp
          {...props}>
          {children}
        </Comp>
      );
    },
    EMPTY_ARRAY,
  );

  const renderContent = useCallback(
    () => {
      return (
        <Wrapper>
          {content.map(renderItem)}
        </Wrapper>
      );
    },
    [Wrapper, content, renderItem],
  );

  if (item.schema.title != null) {
    return (
      <div className='flex flex-col w-full'>
          <div className="w-full mb-4">
            <h5 className="text-md">{i18n.t(item.schema.title)}</h5>
            <Divider />
          </div>
          {renderContent()}
      </div>
    );
  }

  return renderContent();
};

export const Panel = ({item}:{item: SchemaBlock;}) => {
  return null;
}

const testForm:FormView = {
  type: 'form',
  name: '',
  items: [
    {
      type: 'flex',
      items: [
        {
          type: 'flex',
          name:'hhhh',
          props: {
            direction: 'row'
          },
          render: (props) => {
            return ''
          }
        }
      ]
    }
  ],
  uid: ''
}