// TypeScript type definitions
//
// After modifying project's source code make appropriate changes to this file,
// especially when you do one of the following:
//  - add/remove/rename a class
//  - add/remove/rename a method
//  - change method signature
//
declare namespace zipkin {
  interface Context<T> {
    setContext(ctx: T): void;
    getContext(): T;
    scoped<V>(callback: () => V): V;
    letContext<V>(ctx: T, callback: () => V): V;
  }

  class Tracer {
    constructor(args: { ctxImpl: Context<TraceId>, recorder: Recorder, sampler?: sampler.Sampler, traceId128Bit?: boolean });
    id: TraceId;

    scoped<V>(callback: () => V): V;
    createRootId(): TraceId;
    createChildId(): TraceId;
    letChildId<V>(callback: (traceId: TraceId) => V): V;
    setId(traceId: TraceId): void;
    recordAnnotation(annotation: IAnnotation): void;
    recordMessage(message: any): void;
    recordServiceName(serviceName: any): void;
    recordRpc(name: any): void;
    recordClientAddr(inetAddress: InetAddress): void;
    recordServerAddr(inetAddress: InetAddress): void;
    recordLocalAddr(inetAddress: InetAddress): void;
    recordBinary(key: string, value: boolean | string | number): void;
    writeIdToConsole(message: any): void;
  }

  class TraceId {
    constructor(args?: {
      traceId?:  option.IOption<string>,
      parentId?: option.IOption<string>,
      spanId?:   string,
      sampled?:  option.IOption<string>,
      flags?:    number
    });
    readonly spanId: string;
    readonly parentId: string;
    readonly traceId: string;
    readonly sampled: option.IOption<boolean>;
    readonly flags: number;
    isDebug(): boolean;
    toString(): string;
  }

  const createNoopTracer: () => void;

  namespace option {
    interface IOption<T> {
      type: "Some" | "None";
      present: boolean;

      map: <V>(fn: (value: T) => V) => IOption<V>;
      ifPresent: <V>(fn: (value: T) => V) => IOption<V>;
      flatMap: <V>(fn: (value: T) => V) => IOption<V>;
      getOrElse: <V>(fnOrValue: (() => V) | V) => T;
      equals: (other: IOption<T>) => boolean;
      toString: () => string;
    }

    interface INone extends IOption<any> {
      type: "None";
      present: false;

      map: <V>(fn: (value: any) => V) => INone;
      flatMap: <V>(fn: (value: any) => V) => INone;
      equals: (other: IOption<any>) => boolean;
      toString: () => string;
    }

    const None: INone;

    class Some<T> implements IOption<T> {
      constructor(value: T);
      type: "Some" | "None";
      present: true;

      map: <V>(fn: (value: T) => V) => IOption<V>;
      ifPresent: <V>(fn: (value: T) => V) => IOption<V>;
      flatMap: <V>(fn: (value: T) => V) => IOption<V>;
      getOrElse: () => T;
      equals: (other: IOption<T>) => boolean;
      toString: () => string;
    }
  }

  /** Used by the HttpLogger transport to convert spans to JSON */
  interface JsonEncoder {
    encode: (span: model.Span) => string;
  }

  namespace jsonEncoder {
    const JSON_V1: JsonEncoder;
    const JSON_V2: JsonEncoder;
  }

  interface IAnnotation {
  }

  namespace Annotation {
    class ClientSend implements IAnnotation { }
    class ClientRecv implements IAnnotation { }
    class ServerSend implements IAnnotation { }
    class ServerRecv implements IAnnotation { }

    class Message implements IAnnotation {
      constructor(message: string);
    }

    class ServiceName implements IAnnotation {
      constructor(serviceName: string);
    }

    class Rpc implements IAnnotation {
      constructor(name: string);
    }

    class ClientAddr implements IAnnotation {
      constructor(args: { host: InetAddress, port: number });
    }

    class ServerAddr implements IAnnotation {
      constructor(args: { serviceName: string, host?: InetAddress, port?: number });
    }

    class LocalAddr implements IAnnotation {
      constructor(args?: { host?: InetAddress, port?: number });
    }

    class BinaryAnnotation implements IAnnotation {
      constructor(key: string, value: boolean | string | number);
    }
  }

  class InetAddress {
    constructor(addr: string);
    static getLocalAddress(): InetAddress;
  }

  namespace HttpHeaders {
    const TraceId: string;
    const SpanId: string;
    const ParentSpanId: string;
    const Sampled: string;
    const Flags: string;
  }

  interface Recorder {
    record: (rec: any) => void;
  }

  class BatchRecorder implements Recorder {
    constructor(args: { logger: Logger, timeout?: number });
    record: (rec: any) => void;
  }

  class ConsoleRecorder implements Recorder {
    constructor(args?: { logger?: Logger });
    record: (rec: any) => void;
  }

  class ExplicitContext implements Context<TraceId> {
    setContext(ctx: TraceId): void;
    getContext(): TraceId;
    scoped<V>(callback: () => V): V;
    letContext<V>(ctx: TraceId, callback: () => V): V;
  }

  namespace sampler {
    class Sampler {
      constructor(evaluator: (traceId: TraceId) => boolean)
      shouldSample(traceId: TraceId): option.IOption<boolean>
      toString(): String
    }
    function neverSample(traceId: TraceId): boolean
    function alwaysSample(traceId: TraceId): boolean
    class CountingSampler extends Sampler {
      constructor(sampleRate: number)
    }
  }

  namespace model {
    class Endpoint {}
    class Span {}
  }

  class Request {
  }

  /** The Logger (or transport) is what the Recorder uses to send spans to Zipkin.
   * @see https://github.com/openzipkin/zipkin-js/#transports Official transport implementations
   */
  interface Logger {
    logSpan(span: model.Span): void;
  }

  namespace Instrumentation {
    class HttpServer {
      constructor(args: { tracer: Tracer, serviceName: string, port: string | number });

      recordRequest(
        method: string,
        requestUrl: string,
        readHeader: <T> (header: string) => option.IOption<T>
      ): string;
      recordResponse(traceId: string, statusCode: string, error?: Error): void;
    }

    class HttpClient {
      constructor(args: { tracer: Tracer, serviceName: string, remoteServiceName?: string });

      recordRequest<T>(
        request: T,
        url: string,
        method: string
      ): T;
      recordResponse(traceId: string, statusCode: string): void;
      recordError(traceId: string, error: Error): void;
    }
  }
}

export = zipkin;
