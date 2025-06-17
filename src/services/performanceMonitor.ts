// Performance Monitoring Service for Database Operations
import { Query, Document } from 'mongoose';

interface QueryPerformance {
  operation: string;
  collection: string;
  duration: number;
  query?: Record<string, unknown>;
  timestamp: Date;
}

class PerformanceMonitor {
  private queryTimes: Map<string, number> = new Map();
  private performanceLog: QueryPerformance[] = [];

  /**
   * Monitor query performance by wrapping Mongoose queries
   */
  monitorQuery<T extends Document>(query: Query<T[], T>): Query<T[], T> {
    const startTime = performance.now();
    const queryId = Math.random().toString(36).substr(2, 9);
    
    this.queryTimes.set(queryId, startTime);
    
    const originalExec = query.exec.bind(query);
    query.exec = async () => {
      try {
        const result = await originalExec();
        this.logQueryPerformance(queryId, query);
        return result;
      } catch (error) {
        this.logQueryPerformance(queryId, query, error as Error);
        throw error;
      }
    };
    
    return query;
  }

  /**
   * Monitor document save operations
   */
  monitorSave<T extends Document>(doc: T): T {
    const startTime = performance.now();
    const docId = Math.random().toString(36).substr(2, 9);
    
    this.queryTimes.set(docId, startTime);
    
    const originalSave = doc.save.bind(doc);
    doc.save = async () => {
      try {
        const result = await originalSave();
        this.logSavePerformance(docId, doc);
        return result;
      } catch (error) {
        this.logSavePerformance(docId, doc, error as Error);
        throw error;
      }
    };
    
    return doc;
  }

  private logQueryPerformance<T extends Document>(queryId: string, query: Query<T[], T>, error?: Error) {
    const startTime = this.queryTimes.get(queryId);
    if (!startTime) return;
    
    const duration = performance.now() - startTime;
    const queryPerf: QueryPerformance = {
      operation: this.getQueryOperation(query),
      collection: this.getCollectionName(query),
      duration,
      query: this.getQueryConditions(query),
      timestamp: new Date()
    };
    
    this.performanceLog.push(queryPerf);
    this.queryTimes.delete(queryId);
    
    if (duration > 1000) { // Log slow queries (>1s)
      console.warn('🐌 Slow query detected:', queryPerf);
    }
    
    if (error) {
      console.error('❌ Query error:', error, queryPerf);
    }
  }

  private logSavePerformance<T extends Document>(docId: string, doc: T, error?: Error) {
    const startTime = this.queryTimes.get(docId);
    if (!startTime) return;
    
    const duration = performance.now() - startTime;
    const queryPerf: QueryPerformance = {
      operation: 'save',
      collection: this.getDocumentCollection(doc),
      duration,
      timestamp: new Date()
    };
    
    this.performanceLog.push(queryPerf);
    this.queryTimes.delete(docId);
    
    if (duration > 500) { // Log slow saves (>500ms)
      console.warn('🐌 Slow save detected:', queryPerf);
    }
    
    if (error) {
      console.error('❌ Save error:', error, queryPerf);
    }
  }

  private getQueryOperation<T extends Document>(query: Query<T[], T>): string {
    // TypeScript workaround for accessing internal Mongoose properties
    const queryWithOp = query as unknown as { op?: string };
    return queryWithOp.op || 'find';
  }

  private getCollectionName<T extends Document>(query: Query<T[], T>): string {
    // TypeScript workaround for accessing internal Mongoose properties
    const queryWithModel = query as unknown as { model?: { collection?: { name?: string } } };
    return queryWithModel.model?.collection?.name || 'unknown';
  }

  private getQueryConditions<T extends Document>(query: Query<T[], T>): Record<string, unknown> {
    // TypeScript workaround for accessing internal Mongoose properties
    const queryWithGetQuery = query as unknown as { getQuery?: () => Record<string, unknown> };
    return queryWithGetQuery.getQuery?.() || {};
  }

  private getDocumentCollection<T extends Document>(doc: T): string {
    // TypeScript workaround for accessing collection name
    const docWithCollection = doc.constructor as unknown as { collection?: { name?: string } };
    return docWithCollection.collection?.name || 'unknown';
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    const totalQueries = this.performanceLog.length;
    const avgDuration = totalQueries > 0 
      ? this.performanceLog.reduce((sum, q) => sum + q.duration, 0) / totalQueries 
      : 0;
    
    const slowQueries = this.performanceLog.filter(q => q.duration > 1000);
    
    return {
      totalQueries,
      averageDuration: Math.round(avgDuration),
      slowQueries: slowQueries.length,
      recentQueries: this.performanceLog.slice(-10)
    };
  }

  /**
   * Clear performance log
   */
  clearLog() {
    this.performanceLog = [];
    this.queryTimes.clear();
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export helper functions for easy use
export function monitorQuery<T extends Document>(query: Query<T[], T>): Query<T[], T> {
  return performanceMonitor.monitorQuery(query);
}

export function monitorSave<T extends Document>(doc: T): T {
  return performanceMonitor.monitorSave(doc);
}

export function getPerformanceStats() {
  return performanceMonitor.getPerformanceStats();
}
