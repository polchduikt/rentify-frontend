import { useParams } from 'react-router-dom';
import { PropertyEditorPage } from './PropertyEditorPage';

const EditPropertyPage = () => {
  const { id } = useParams<{ id: string }>();
  const propertyId = Number(id);

  return <PropertyEditorPage mode="edit" propertyId={propertyId} />;
};

export default EditPropertyPage;

