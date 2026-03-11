interface CreatePropertyStatusBannersProps {
  submitError: string;
  submitSuccess: string;
}

export const CreatePropertyStatusBanners = ({ submitError, submitSuccess }: CreatePropertyStatusBannersProps) => (
  <>
    {submitError ? (
      <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>
    ) : null}

    {submitSuccess ? (
      <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        {submitSuccess}
      </div>
    ) : null}
  </>
);
