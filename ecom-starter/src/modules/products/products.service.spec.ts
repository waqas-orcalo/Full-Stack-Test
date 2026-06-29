import { ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { Product } from './schemas/product.schema';

/**
 * Unit tests for ProductsService using a mocked Mongoose model.
 * Demonstrates the testing convention: isolate the service, stub the model.
 */
describe('ProductsService', () => {
  let service: ProductsService;
  const model = {
    exists: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getModelToken(Product.name), useValue: model },
      ],
    }).compile();
    service = moduleRef.get(ProductsService);
  });

  it('rejects duplicate SKUs on create', async () => {
    model.exists.mockResolvedValue(true);
    await expect(
      service.create({ name: 'X', price: 1, sku: 'dup' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('creates a product with an upper-cased SKU', async () => {
    model.exists.mockResolvedValue(false);
    model.create.mockResolvedValue({ name: 'X', sku: 'ABC' });
    await service.create({ name: 'X', price: 1, sku: 'abc' } as any);
    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({ sku: 'ABC' }),
    );
  });

  it('throws NotFound when removing a missing product', async () => {
    model.findOneAndUpdate.mockReturnValue({
      exec: () => Promise.resolve(null),
    });
    await expect(service.remove('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
