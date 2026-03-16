import { Suspense, lazy } from 'react';
import { CreatePropertySidebar } from '@/components/property-create/CreatePropertySidebar';
import { CreatePropertyStatusBanners } from '@/components/property-create/CreatePropertyStatusBanners';
import { CreatePropertyStepActions } from '@/components/property-create/CreatePropertyStepActions';
import { CreatePropertyStepHeader } from '@/components/property-create/CreatePropertyStepHeader';
import { useCreatePropertyPage } from '@/hooks/property-create';

type CreatePropertyPageModel = ReturnType<typeof useCreatePropertyPage>;

const PropertyCreateBasicsStep = lazy(() =>
  import('@/components/property-create/steps/PropertyCreateBasicsStep').then((module) => ({
    default: module.PropertyCreateBasicsStep,
  }))
);
const PropertyCreateLocationStep = lazy(() =>
  import('@/components/property-create/steps/PropertyCreateLocationStep').then((module) => ({
    default: module.PropertyCreateLocationStep,
  }))
);
const PropertyCreateDetailsStep = lazy(() =>
  import('@/components/property-create/steps/PropertyCreateDetailsStep').then((module) => ({
    default: module.PropertyCreateDetailsStep,
  }))
);
const PropertyCreateAmenitiesStep = lazy(() =>
  import('@/components/property-create/steps/PropertyCreateAmenitiesStep').then((module) => ({
    default: module.PropertyCreateAmenitiesStep,
  }))
);
const PropertyCreatePricingStep = lazy(() =>
  import('@/components/property-create/steps/PropertyCreatePricingStep').then((module) => ({
    default: module.PropertyCreatePricingStep,
  }))
);

const STEP_FALLBACK = (
  <div className="space-y-4">
    <div className="h-10 w-1/3 animate-pulse rounded-2xl bg-slate-100" />
    <div className="h-56 animate-pulse rounded-3xl bg-slate-100" />
    <div className="h-32 animate-pulse rounded-3xl bg-slate-100" />
  </div>
);

const renderStepContent = (step: number, model: CreatePropertyPageModel) => {
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

const CreatePropertyPage = () => {
  const model = useCreatePropertyPage();
  const isLastStep = model.step === model.totalSteps - 1;

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
            onSaveDraft={() => void model.saveDraftProperty()}
            onCancel={model.cancelEditing}
          />
        </section>
      </div>
    </div>
  );
};

export default CreatePropertyPage;
