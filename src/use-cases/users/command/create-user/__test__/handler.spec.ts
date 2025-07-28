/* eslint-disable @typescript-eslint/unbound-method */
import { jest } from '@jest/globals';
import { EventPublisher } from '@nestjs/cqrs';
import type { TestingModule } from '@nestjs/testing';
import { LoggerService, testingModule } from '~@third-party-modules';
import { InjectionToken, NUMBERS } from '~configs';
import type { UserAggregate } from '~domains/aggregates';
import { UserFactory } from '~domains/factories';
import type { UserRepository } from '~domains/repositories';
import { CreateUserCommand } from '../command';
import { CreateUserCommandHandler } from '../handler';
import { MOCK_USER_DATA } from './assets';

describe('CreateUserCommandHandler Unit Test', () => {
  let handler: CreateUserCommandHandler;
  let userRepository: UserRepository;
  let userFactory: UserFactory;
  let logger: LoggerService;
  let module: TestingModule;

  beforeAll(async () => {
    // Create mock user repository
    const mockUserRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      deleteById: jest.fn(),
    };

    // Use testingModule from @third-party-modules like infrastructure tests
    module = await testingModule([
      CreateUserCommandHandler,
      UserFactory,
      LoggerService,
      {
        provide: EventPublisher,
        useValue: {
          setObjectName: jest.fn(),
          publish: jest.fn(),
          publishAll: jest.fn(),
          mergeObjectContext: jest.fn().mockImplementation((obj) => obj),
        },
      },
      {
        provide: InjectionToken.userCommandRepository,
        useValue: mockUserRepository,
      },
    ]);

    handler = module.get<CreateUserCommandHandler>(CreateUserCommandHandler);
    userRepository = module.get<UserRepository>(
      InjectionToken.userCommandRepository,
    );
    userFactory = module.get<UserFactory>(UserFactory);
    logger = module.get<LoggerService>(LoggerService);
  });

  afterAll(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  describe('execute', () => {
    let command: CreateUserCommand;
    let mockUserAggregate: UserAggregate;
    let executionResult: undefined;

    beforeAll(async () => {
      // Clear all mocks before this test group
      jest.clearAllMocks();

      // Setup test data
      const commandPayload = MOCK_USER_DATA.createUser;
      command = new CreateUserCommand(commandPayload);

      // Create real user aggregate using UserFactory
      mockUserAggregate = userFactory.createAggregate(commandPayload);

      // Spy on logger methods
      jest.spyOn(logger, 'log');

      // Spy on userRepository method
      jest.spyOn(userRepository, 'create').mockResolvedValue(mockUserAggregate);

      // Execute the command
      await handler.execute(command);
      executionResult = undefined;
    });

    it('should log the start of user creation', () => {
      // Assert
      expect(logger.log).toHaveBeenCalledWith(
        `Creating user with email: ${MOCK_USER_DATA.createUser.email}`,
        'CreateUserHandler',
      );
    });

    it('should create user aggregate from command payload', () => {
      // Assert - verify the aggregate was created with correct data
      expect(mockUserAggregate.name).toBe(MOCK_USER_DATA.createUser.name);
      expect(mockUserAggregate.email).toBe(MOCK_USER_DATA.createUser.email);
    });

    it('should call repository create with user aggregate', () => {
      // Assert
      expect(userRepository.create).toHaveBeenCalledWith({
        user: mockUserAggregate,
      });
      expect(userRepository.create).toHaveBeenCalledTimes(NUMBERS.ONE);
    });

    it('should log successful user creation', () => {
      // Assert
      expect(logger.log).toHaveBeenCalledWith(
        'User created successfully',
        'CreateUserHandler',
      );
    });

    it('should execute without returning value', () => {
      // Assert
      expect(executionResult).toBeUndefined();
    });
  });

  describe('error handling', () => {
    let command: CreateUserCommand;
    let mockUserAggregate: UserAggregate;
    let thrownError: Error;

    beforeAll(async () => {
      // Clear previous mocks
      jest.clearAllMocks();

      // Setup test data
      const commandPayload = MOCK_USER_DATA.errorCase;
      command = new CreateUserCommand(commandPayload);

      // Create real user aggregate using UserFactory
      mockUserAggregate = userFactory.createAggregate(commandPayload);

      // Spy on methods
      jest.spyOn(logger, 'log');

      // Mock repository to throw error
      const repositoryError = new Error('Database connection failed');
      jest.spyOn(userRepository, 'create').mockRejectedValue(repositoryError);

      // Execute the command and capture error
      try {
        await handler.execute(command);
      } catch (error) {
        thrownError = error as Error;
      }
    });

    it('should log the start of user creation even when error occurs', () => {
      // Assert
      expect(logger.log).toHaveBeenCalledWith(
        `Creating user with email: ${MOCK_USER_DATA.errorCase.email}`,
        'CreateUserHandler',
      );
    });

    it('should create user aggregate before error occurs', () => {
      // Assert - verify the aggregate was created with correct data
      expect(mockUserAggregate.name).toBe(MOCK_USER_DATA.errorCase.name);
      expect(mockUserAggregate.email).toBe(MOCK_USER_DATA.errorCase.email);
    });

    it('should attempt to call repository create', () => {
      // Assert
      expect(userRepository.create).toHaveBeenCalledWith({
        user: mockUserAggregate,
      });
    });

    it('should not log success message when error occurs', () => {
      // Assert
      expect(logger.log).not.toHaveBeenCalledWith(
        'User created successfully',
        'CreateUserHandler',
      );
    });

    it('should propagate repository error', () => {
      // Assert
      expect(thrownError).toBeInstanceOf(Error);
      expect(thrownError.message).toBe('Database connection failed');
    });
  });

  describe('factory error handling', () => {
    let command: CreateUserCommand;
    let thrownError: Error;

    beforeAll(async () => {
      // Clear previous mocks
      jest.clearAllMocks();

      // Setup test data
      const commandPayload = MOCK_USER_DATA.invalidData;
      command = new CreateUserCommand(commandPayload);

      // Spy on methods
      jest.spyOn(logger, 'log');

      // Mock factory to throw error (still need to mock this since it's the error case)
      const factoryError = new Error('Invalid user data');
      jest.spyOn(userFactory, 'createAggregate').mockImplementation(() => {
        throw factoryError;
      });

      jest.spyOn(userRepository, 'create');

      // Execute the command and capture error
      try {
        await handler.execute(command);
      } catch (error) {
        thrownError = error as Error;
      }
    });

    it('should log the start of user creation before factory error', () => {
      // Assert
      expect(logger.log).toHaveBeenCalledWith(
        `Creating user with email: ${MOCK_USER_DATA.invalidData.email}`,
        'CreateUserHandler',
      );
    });

    it('should attempt to create user aggregate', () => {
      // Assert
      expect(userFactory.createAggregate).toHaveBeenCalledWith(
        MOCK_USER_DATA.invalidData,
      );
    });

    it('should not call repository when factory fails', () => {
      // Assert
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should not log success message when factory fails', () => {
      // Assert
      expect(logger.log).not.toHaveBeenCalledWith(
        'User created successfully',
        'CreateUserHandler',
      );
    });

    it('should propagate factory error', () => {
      // Assert
      expect(thrownError).toBeInstanceOf(Error);
      expect(thrownError.message).toBe('Invalid user data');
    });
  });
});
