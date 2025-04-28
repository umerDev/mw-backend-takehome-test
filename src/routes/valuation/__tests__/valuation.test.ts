import Fastify from 'fastify';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { valuationRoutes } from '../index';
import { VehicleValuationRequest } from '../types/vehicle-valuation-request';
import { FastifyInstance } from 'fastify';

interface MockRepo  {
  insert: ReturnType<typeof vi.fn>;
  findOneBy: ReturnType<typeof vi.fn>;
}

let fastify: FastifyInstance;
let mockRepo: MockRepo;

beforeEach(async () => {
  // Mock the external valuation fetcher
  vi.mock('@app/super-car/super-car-valuation', () => ({
    fetchValuationFromSuperCarValuation: vi.fn().mockResolvedValue({
      vrm: 'ABC123',
      mileage: 10000,
      value: 50000,
    }),
  }));
  fastify = Fastify();
  mockRepo = {
    insert: vi.fn().mockResolvedValue(undefined),
    findOneBy: vi.fn().mockResolvedValue({ vrm: 'ABC123', mileage: 10000, value: 50000 }),
  };
  (fastify as any).decorate('orm', {
    getRepository: vi.fn().mockReturnValue(mockRepo),
  });
  valuationRoutes(fastify);
  await fastify.ready();
});


afterAll(async () => {
  await fastify.close();
});

describe('ValuationController (e2e)', () => {
  describe('PUT /valuations/', () => {
    it('should return 404 if VRM is missing', async () => {
      const requestBody: VehicleValuationRequest = {
        mileage: 10000,
      };

      const res = await fastify.inject({
        url: '/valuations',
        method: 'PUT',
        body: requestBody,
      });

      expect(res.statusCode).toStrictEqual(404);
    });

    it('should return 400 if VRM is 8 characters or more', async () => {
      const requestBody: VehicleValuationRequest = {
        mileage: 10000,
      };

      const res = await fastify.inject({
        url: '/valuations/12345678',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(400);
    });

    it('should return 400 if mileage is missing', async () => {
      const requestBody: VehicleValuationRequest = {
        // @ts-expect-error intentionally malformed payload
        mileage: null,
      };

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(400);
    });

    it('should return 400 if mileage is negative', async () => {
      const requestBody: VehicleValuationRequest = {
        mileage: -1,
      };

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toStrictEqual(400);
    });

    it('should return 200 with valid request', async () => {
      const requestBody: VehicleValuationRequest = {
        mileage: 10000,
      };

      const res = await fastify.inject({
        url: '/valuations/ABC123',
        body: requestBody,
        method: 'PUT',
      });

      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body)).toMatchObject({
        vrm: 'ABC123',
        mileage: 10000,
        value: 50000,
      });
    });
  });

  describe('GET /valuations/:vrm', () => {
    it('should return 404 if VRM is missing', async () => {
      const res = await fastify.inject({
        url: '/valuations',
        method: 'GET',
      });

      expect(res.statusCode).toStrictEqual(404);
    });


    it('should return 400 if VRM is 8 characters or more', async () => {
      const res = await fastify.inject({
        url: '/valuations/12345678',
        method: 'GET',
      });

      expect(res.statusCode).toStrictEqual(400);
    })

    it('should return 200 if VRM is valid', async () => {
      const mockValuation = {
        vrm: 'ABC123',
        mileage: 11111,
        value: 50000,
      };

      (mockRepo.findOneBy).mockReturnValue(mockValuation);

      const res = await fastify.inject({
        url: `/valuations/${mockValuation.vrm}`,
        method: 'GET',
      });

      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ vrm: mockValuation.vrm });
      expect(res.statusCode).toStrictEqual(200);
      expect(JSON.parse(res.body)).toMatchObject(mockValuation);
    })
  });
});
