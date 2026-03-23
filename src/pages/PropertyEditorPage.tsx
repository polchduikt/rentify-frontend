import { Suspense, lazy } from 'react';
import { CreatePropertySidebar } from '@/components/property-create/CreatePropertySidebar';
import { CreatePropertyStatusBanners } from '@/components/property-create/CreatePropertyStatusBanners';
import { CreatePropertyStepActions } from '@/components/property-create/CreatePropertyStepActions';
import { CreatePropertyStepHeader } from '@/components/property-create/CreatePropertyStepHeader';
import { useCreatePropertyPage } from '@/hooks/property-create';

type PropertyEditorMode = 'create' | 'edit';

interface PropertyEditorPageProps {
  mode: PropertyEditorMode;
  propertyId?: number;
}

type PropertyEditorPageModel = ReturnType<typeof useCreatePropertyPage>;

const PropertyCreateBasicsStep = lazy(() =>
  import('@/components/property-create/steps/PropertyCreateBasicsStep').then((module) => ({
    default: module.PropertyCreateBasicsStep,
  })),
);
const PropertyCreateLocationStep = lazy(() =>
  import('@/components/property-create/steps/PropertyCreateLocationStep').then((module) => ({
    default: module.PropertyCreateLocationStep,
  })),
);
const PropertyCreateDetailsStep = lazy(() =>
  import('@/components/property-create/steps/PropertyCreateDetailsStep').then((module) => ({
    default: module.PropertyCreateDetailsStep,
  })),
);
const PropertyCreateAmenitiesStep = lazy(() =>
  import('@/components/property-create/steps/PropertyCreateAmenitiesStep').then((module) => ({
    default: module.PropertyCreateAmenitiesStep,
  })),
);
const PropertyCreatePricingStep = lazy(() =>
  import('@/components/property-create/steps/PropertyCreatePricingStep').then((module) => ({
    default: module.PropertyCreatePricingStep,
  })),
);

const STEP_FALLBACK = (
  <div className="space-y-4">
    <div className="h-10 w-1/3 animate-pulse rounded-2xl bg-slate-100" />
    <div className="h-56 animate-pulse rounded-3xl bg-slate-100" />
    <div className="h-32 animate-pulse rounded-3xl bg-slate-100" />
  </div>
);

const renderStepContent = (step: number, model: PropertyEditorPageModel) => {
  switch (step) {
    case 0:
      return <PropertyCreateBasicsStep model={model} />;
    case 1:
      return <PropertyCreateLocationStep model={model} />;
    case 2:
      return <PropertyCreateDetailsStep model={model} />;
    case 3:
      return <PropertyCreateAmenitiesStep model={model} />;
    case 4:
      return <PropertyCreatePricingStep model={model} />;
    default:
      return null;
  }
};

const handleSaveDraftError = (error: unknown) => {
  console.error('Failed to save property draft', error);
};

export const PropertyEditorPage = ({ mode, propertyId }: PropertyEditorPageProps) => {
  const isEditMode = mode === 'edit';
  const numericPropertyId = Number(propertyId ?? 0);
  const isValidPropertyId = Number.isFinite(numericPropertyId) && numericPropertyId > 0;
  const model = useCreatePropertyPage({
    propertyId: isEditMode && isValidPropertyId ? numericPropertyId : undefined,
  });
  const isLastStep = model.step === model.totalSteps - 1;

  if (isEditMode && !isValidPropertyId) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">Некоректний ID оголошення.</div>
      </div>
    );
  }

  if (isEditMode && model.initialDataLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-40 animate-pulse rounded-3xl bg-slate-200" />
        <div className="h-96 animate-pulse rounded-3xl bg-slate-200" />
      </div>
    );
  }

  if (isEditMode && model.initialDataError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{model.initialDataError}</div>
      </div>
    );
  }

  return (
    <div className="create-property-page-shell min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-[1400px] gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <CreatePropertySidebar step={model.step} stepLocks={model.stepLocks} onStepClick={model.goToStep} />

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <CreatePropertyStepHeader step={model.step} />
          <CreatePropertyStatusBanners submitError={model.submitError} submitSuccess={model.submitSuccess} />

          <Suspense fallback={STEP_FALLBACK}>{renderStepContent(model.step, model)}</Suspense>

          <CreatePropertyStepActions
            canGoPrev={model.canGoPrev}
            isSubmitting={model.isSubmitting}
            isLastStep={isLastStep}
            isStepComplete={model.stepCompletion[model.step]}
            onPrev={model.goPrevStep}
            onNext={model.goNextStep}
            onPublish={model.publishProperty}
            onSaveDraft={() => model.saveDraftProperty().catch(handleSaveDraftError)}
            onCancel={model.cancelEditing}
          />
        </section>
      </div>
    </div>
  );
};

