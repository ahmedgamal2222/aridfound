import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSectionsComponent } from './manage-sections.component';

describe('ManageSectionsComponent', () => {
  let component: ManageSectionsComponent;
  let fixture: ComponentFixture<ManageSectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageSectionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageSectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
