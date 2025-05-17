import { cn, previousClose } from '../utils';
import type { ChartDatum } from '@/types/stock';

describe('utils', () => {
  describe('cn function', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
      expect(cn('class1', { class2: true, class3: false })).toBe('class1 class2');
      expect(cn('class1', null, undefined, 'class2')).toBe('class1 class2');
    });
  });

  describe('previousClose function', () => {
    it('should return 0 if chart data is empty', () => {
      expect(previousClose([])).toBe(0);
    });

    it('should return the previous day closing price', () => {
      // Mock the current date to be 2023-07-15
      const realDate = Date;
      const mockDate = new Date('2023-07-15T12:00:00Z');
      
      // Mock Date class
      global.Date = class extends Date {
        constructor(date?: string | number | Date) {
          if (date) {
            super(date);
          } else {
            super(mockDate);
          }
        }
      } as typeof Date;

      const chartData: ChartDatum[] = [
        { time: '2023-07-10T16:00:00Z', price: 150.0, open: 148.0, high: 152.0, low: 147.0, volume: 1000000 },
        { time: '2023-07-11T10:00:00Z', price: 155.0, open: 151.0, high: 156.0, low: 150.0, volume: 1200000 },
        { time: '2023-07-11T16:00:00Z', price: 160.0, open: 155.0, high: 162.0, low: 154.0, volume: 1100000 },
        { time: '2023-07-12T10:00:00Z', price: 158.0, open: 161.0, high: 163.0, low: 157.0, volume: 900000 },
        { time: '2023-07-12T16:00:00Z', price: 162.0, open: 158.0, high: 164.0, low: 157.0, volume: 950000 },
        { time: '2023-07-13T10:00:00Z', price: 164.0, open: 163.0, high: 166.0, low: 162.0, volume: 1050000 },
        { time: '2023-07-13T16:00:00Z', price: 165.0, open: 164.0, high: 167.0, low: 163.0, volume: 980000 },
        { time: '2023-07-14T10:00:00Z', price: 168.0, open: 166.0, high: 169.0, low: 165.0, volume: 1200000 },
        { time: '2023-07-14T16:00:00Z', price: 170.0, open: 168.0, high: 172.0, low: 167.0, volume: 1150000 },
        { time: '2023-07-15T10:00:00Z', price: 172.0, open: 171.0, high: 174.0, low: 170.0, volume: 900000 },
      ];

      expect(previousClose(chartData)).toBe(170.0); // Should return the 07-14 closing price

      // Restore the original Date
      global.Date = realDate;
    });

    it('should return the first price if no previous day data found', () => {
      // Mock current date to be 2023-07-10 (same as first data point)
      const realDate = Date;
      const mockDate = new Date('2023-07-10T12:00:00Z');
      
      // Mock Date class
      global.Date = class extends Date {
        constructor(date?: string | number | Date) {
          if (date) {
            super(date);
          } else {
            super(mockDate);
          }
        }
      } as typeof Date;

      const chartData: ChartDatum[] = [
        { time: '2023-07-10T10:00:00Z', price: 150.0, open: 148.0, high: 152.0, low: 147.0, volume: 1000000 },
        { time: '2023-07-10T16:00:00Z', price: 155.0, open: 150.0, high: 156.0, low: 149.0, volume: 1100000 },
      ];

      expect(previousClose(chartData)).toBe(150.0); // Should return the first price

      // Restore the original Date
      global.Date = realDate;
    });
  });
}); 