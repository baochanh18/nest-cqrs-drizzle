export interface IBaseFactory<Aggregate, Entity> {
  createAggregate: (plainObject: Partial<Entity>) => Aggregate;
  createEntity: (plainObject: Aggregate) => Entity;
}
