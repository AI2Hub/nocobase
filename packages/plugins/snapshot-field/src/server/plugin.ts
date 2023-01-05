import { Model } from '@nocobase/database';
import { InstallOptions, Plugin } from '@nocobase/server';
import { resolve } from 'path';
import { SnapshotField } from './fields/snapshot-field';

export class SnapshotFieldPlugin extends Plugin {
  afterAdd() {}

  async beforeLoad() {
    const collectionHandler = async (model: Model, { transaction }) => {
      const collectionDoc = model.toJSON();
      const collectionsHistoryRepository = this.app.db.getRepository('collectionsHistory');
      const fieldsHistoryRepository = this.app.db.getRepository('fieldsHistory');

      const existCollection: Model = await collectionsHistoryRepository.findOne({
        filter: {
          name: collectionDoc.name,
        },
      });

      if (existCollection) {
        // 删除表和其关联字段
        await existCollection.destroy({
          transaction,
        });
      }

      await collectionsHistoryRepository.create({
        values: collectionDoc,
        transaction,
      });

      await fieldsHistoryRepository.createMany({
        records: collectionDoc.fields ?? [],
        transaction,
      });
    };

    this.app.db.on('collections.afterCreateWithAssociations', collectionHandler);

    const fieldHandler = async (model: Model, { transaction }) => {
      const fieldDoc = model.get();
      const fieldsHistoryRepository = this.app.db.getRepository('fieldsHistory');
      const existField: Model = await fieldsHistoryRepository.findOne({
        filter: {
          name: fieldDoc.name,
        },
      });
      if (existField) {
        await existField.destroy({
          transaction,
        });
      }
      await fieldsHistoryRepository.create({
        values: fieldDoc,
        transaction,
      });
    };

    this.app.db.on('fields.afterCreateWithAssociations', fieldHandler);
  }

  async load() {
    // 导入 collection
    await this.db.import({
      directory: resolve(__dirname, 'collections'),
    });

    this.app.db.registerFieldTypes({
      snapshot: SnapshotField,
    });
  }

  // 初始化安装的时候
  async install(options?: InstallOptions) {
    await this.app.db.sequelize.transaction(async (transaction) => {
      const collectionsRepository = this.app.db.getRepository('collections');
      const collectionsHistoryRepository = this.app.db.getRepository('collectionsHistory');

      if ((await collectionsHistoryRepository.find()).length === 0) {
        const collectionsModels: Model[] = await collectionsRepository.find();
        await collectionsHistoryRepository.createMany({
          records: collectionsModels.map((m) => m.get()),
          transaction,
        });
      }

      const fieldsRepository = this.app.db.getRepository('fields');
      const fieldsHistoryRepository = this.app.db.getRepository('fieldsHistory');

      if ((await fieldsHistoryRepository.find()).length === 0) {
        const fieldsModels: Model[] = await fieldsRepository.find();
        await fieldsHistoryRepository.createMany({
          records: fieldsModels.map((m) => m.get()),
          transaction,
        });
      }
    });
  }

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default SnapshotFieldPlugin;