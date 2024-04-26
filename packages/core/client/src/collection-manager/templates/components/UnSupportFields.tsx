import React from 'react';
import { Table, Divider } from 'antd';
import { useTranslation } from 'react-i18next';

export const UnSupportFields = ({ dataSource }) => {
  const { t } = useTranslation();
  const columns = [
    {
      title: t('Field name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('Field database type'),
      dataIndex: 'rawType',
      key: 'rawType',
    },
  ];
  return (
    dataSource?.length > 0 && (
      <>
        <Divider plain orientation="left" orientationMargin="0">
          <h3>{t('Unknown field type')}</h3>
        </Divider>
        <div style={{ marginBottom: '15px' }}>
          {t('The following field types are not compatible and do not support output and display')}
        </div>
        <Table columns={columns} dataSource={dataSource} pagination={false} />
      </>
    )
  );
};
