import { CreatePropertySidebar } from '@/components/property-create/CreatePropertySidebar';
import { CreatePropertyStatusBanners } from '@/components/property-create/CreatePropertyStatusBanners';
import { CreatePropertyStepActions } from '@/components/property-create/CreatePropertyStepActions';
import { CreatePropertyStepHeader } from '@/components/property-create/CreatePropertyStepHeader';
import {
  PropertyCreateAmenitiesStep,
  PropertyCreateBasicsStep,
  PropertyCreateDetailsStep,
  PropertyCreateLocationStep,
  PropertyCreatePricingStep,
} from '@/components/property-create/steps';
import { useCreatePropertyPage } from '@/hooks/property-create';

type CreatePropertyPageModel = ReturnType<typeof useCreatePropertyPage>;

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

          {renderStepContent(model.step, model)}

          <CreatePropertyStepActions
            canGoPrev={model.canGoPrev}
            isSubmitting={model.isSubmitting}
            isLastStep={isLastStep}
            isStepComplete={model.stepCompletion[model.step]}
            onPrev={model.goPrevStep}
            onNext={model.goNextStep}
            onPublish={model.publishProperty}
          />
        </section>
      </div>
    </div>
  );
};

export default CreatePropertyPage;
