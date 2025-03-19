import { ModuleRef } from '@nestjs/core';
import { TraceService } from '../trace.service';
import { ExecutionContext } from '@nestjs/common';

/**
 * A decorator function that adds tracing functionality to a method.
 * It logs the action, module, user (if available), and the first argument of the method call.
 *
 * @param data - An object containing trace information
 * @param data.action - The action being performed
 * @param data.module - The module in which the action is being performed
 * @returns A decorator function that wraps the original method with tracing functionality
 */
export function Trace(data: { action: string; module: string }) {
  /**
   * The actual decorator function that modifies the method descriptor
   *
   * @param target - The prototype of the class for an instance member, or the constructor function for a static member
   * @param propertyKey - The name of the method being decorated
   * @param descriptor - The Property Descriptor for the method being decorated
   * @returns The modified descriptor with tracing functionality added
   */
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const moduleRef: ModuleRef = (this as any).moduleRef;

      if (!moduleRef) {
        console.error(
          'ModuleRef is not available. Make sure it is injected in the controller.',
        );
        return originalMethod.apply(this, args);
      }

      const traceService = moduleRef.get(TraceService, { strict: false });

      if (!traceService) {
        console.error(
          'TraceService is not available. Make sure it is provided in the module.',
        );
        return originalMethod.apply(this, args);
      }

      let user = null;
      const lastArg = args[args.length - 1];

      if (lastArg && typeof lastArg === 'object' && 'switchToHttp' in lastArg) {
        const context: ExecutionContext = lastArg;
        const request = context.switchToHttp().getRequest();
        user = request.user;
      }

      await traceService.log(data.action, data.module, user, args[0]);

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
