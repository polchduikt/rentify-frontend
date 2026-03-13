import { useParams } from 'react-router-dom';
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

type EditPropertyPageModel = ReturnType<typeof useCreatePropertyPage>;

const renderStepContent = (step: number, model: EditPropertyPageModel) => {
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

const EditPropertyPage = () => {
  const { id } = useParams<{ id: string }>();
  const propertyId = Number(id);
  const isValidPropertyId = Number.isFinite(propertyId) && propertyId > 0;
  const model = useCreatePropertyPage({ propertyId: isValidPropertyId ? propertyId : undefined });
  const isLastStep = model.step === model.totalSteps - 1;

  if (!isValidPropertyId) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">Некоректний ID оголошення.</div>
      </div>
    );
  }

  if (model.initialDataLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-40 animate-pulse rounded-3xl bg-slate-200" />
        <div className="h-96 animate-pulse rounded-3xl bg-slate-200" />
      </div>
    );
  }

  if (model.initialDataError) {
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

          {renderStepContent(model.step, model)}

          <CreatePropertyStepActions
            canGoPrev={model.canGoPrev}
            isSubmitting={model.isSubmitting}
            isLastStep={isLastStep}
            isStepComplete={model.stepCompletion[model.step]}
            submitLabel="Зберегти зміни"
            submittingLabel="Збереження..."
            onPrev={model.goPrevStep}
            onNext={model.goNextStep}
            onPublish={model.publishProperty}
          />
        </section>
      </div>
    </div>
  );
};

export default EditPropertyPage;
