import { ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';
import { BaseRouteReuseStrategy } from './base-route-reuse-strategy.service';

export class CustomRouteReuseStrategy extends BaseRouteReuseStrategy {
  private storedRoutes = new Map<string, DetachedRouteHandle>();

  
  override shouldDetach(route: ActivatedRouteSnapshot): boolean {
    const path = route.routeConfig?.path;

    const cacheable = [
      '',
      'income',
      'expenses',
      'employees',
      'products',
      'employee'
    ];

    return cacheable.includes(path ?? '');
  }

  override store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    const path = route.routeConfig?.path;
    if (path !== undefined) {
      this.storedRoutes.set(path, handle);
    }
  }

  override shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const path = route.routeConfig?.path;
    return !!path && this.storedRoutes.has(path);
  }

  override retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const path = route.routeConfig?.path;
    return path ? this.storedRoutes.get(path) || null : null;
  }

  // ✅ Logout support
  clearCache() {
    this.storedRoutes.clear();
  }
}
