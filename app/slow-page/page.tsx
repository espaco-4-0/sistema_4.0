

import { Suspense } from 'react';
import Loading from '../loading'; 

async function ConteudoLento() {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return <h1 className="p-8">Conteúdo principal carregado!</h1>;
}

export default function SlowPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ConteudoLento />
    </Suspense>
  );
}
