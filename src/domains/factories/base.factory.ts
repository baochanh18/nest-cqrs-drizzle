export interface IBaseFactory<Aggregate, Entity> {
  createAggregate: (plainObject: Partial<Entity>) => Aggregate;
  createInsertEntity: (plainObject: Aggregate) => Entity;
}
