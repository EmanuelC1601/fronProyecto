import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';

export interface Breadcrumb {
  label: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private breadcrumbs = new BehaviorSubject<Breadcrumb[]>([]);
  breadcrumbs$ = this.breadcrumbs.asObservable();

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const root = this.router.routerState.root;
        const breadcrumbs: Breadcrumb[] = [];
        this.addBreadcrumb(root, [], breadcrumbs);
        this.breadcrumbs.next(breadcrumbs);
      });
  }

  private addBreadcrumb(
    route: ActivatedRoute,
    parentUrl: string[],
    breadcrumbs: Breadcrumb[]
  ) {
    if (route) {
      const routeUrl = parentUrl.concat(route.snapshot.url.map(url => url.path));
      const breadcrumbLabel = route.snapshot.data['breadcrumb'];

      if (breadcrumbLabel) {
        const breadcrumb: Breadcrumb = {
          label: breadcrumbLabel,
          url: '/' + routeUrl.join('/')
        };
        breadcrumbs.push(breadcrumb);
      }

      this.addBreadcrumb(route.firstChild!, routeUrl, breadcrumbs);
    }
  }
}