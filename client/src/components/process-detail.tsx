import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, FileText, CheckCircle, Clock, AlertCircle, Download } from 'lucide-react';
import { ChatInterface } from './chat-interface';
import { useToast } from '@/hooks/use-toast';

interface ProcessStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
  documents: string[];
  requirements: string[];
}

interface ProcessData {
  id: string;
  title: string;
  type: string;
  description: string;
  status: string;
  progress: number;
  steps: ProcessStep[];
  requiredDocuments: string[];
  legalBasis: string;
  constitutionalArticles: string[];
  timeline: string;
  createdAt: string;
  updatedAt: string;
  metadata: {
    caseNumber?: string;
    court?: string;
    judge?: string;
    opposingParty?: string;
    amount?: string;
    deadline?: string;
    priority: 'low' | 'medium' | 'high';
  };
}

interface ProcessDetailProps {
  processId: string;
  country: string;
}

export function ProcessDetail({ processId, country }: ProcessDetailProps) {
  const [showChat, setShowChat] = useState(false);
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: processData, isLoading } = useQuery<ProcessData>({
    queryKey: ['/api/processes', processId],
    queryFn: async () => {
      const response = await fetch(`/api/processes/${processId}`, {
        headers: { 'x-user-id': '66a1b2c3d4e5f6789abc1234' }
      });
      if (!response.ok) throw new Error('Failed to fetch process');
      return response.json();
    },
    enabled: !!processId
  });

  const updateProcessMutation = useMutation({
    mutationFn: async (updates: Partial<ProcessData>) => {
      if (!processId) throw new Error('Process ID is required');
      const response = await fetch(`/api/processes/${processId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': '66a1b2c3d4e5f6789abc1234'
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Error updating process');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/processes', processId] });
      queryClient.invalidateQueries({ queryKey: ['/api/processes'] });
      toast({ title: 'Proceso actualizado correctamente' });
    },
  });

  const toggleStepMutation = useMutation({
    mutationFn: async ({ stepId, completed }: { stepId: string; completed: boolean }) => {
      const updatedSteps = processData?.steps.map(step =>
        step.id === stepId ? { ...step, completed } : step
      ) || [];
      
      const completedSteps = updatedSteps.filter(step => step.completed).length;
      const progress = Math.round((completedSteps / updatedSteps.length) * 100);
      
      return updateProcessMutation.mutateAsync({
        steps: updatedSteps,
        progress,
        status: progress === 100 ? 'completed' : 'in_progress'
      });
    },
    onSuccess: () => {
      toast({ title: 'Paso actualizado' });
    },
  });

  const generateDocumentMutation = useMutation({
    mutationFn: async () => {
      if (!processId) throw new Error('Process ID is required');
      const response = await fetch(`/api/processes/${processId}/generate-document`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': '66a1b2c3d4e5f6789abc1234'
        },
        body: JSON.stringify({ country }),
      });
      if (!response.ok) throw new Error('Error generating document');
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${processData?.title || 'documento'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: 'Documento generado y descargado' });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Cargando proceso...</p>
        </div>
      </div>
    );
  }

  if (!processData) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
          <p>No se pudo cargar el proceso</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold text-neutral-900">{processData.title}</CardTitle>
              <CardDescription className="text-neutral-500">{processData.description}</CardDescription>
              <div className="flex gap-2 mt-2">
                <Badge variant={processData.status === 'completed' ? 'default' : 'secondary'}>
                  {processData.status === 'completed' ? 'Completado' : 
                   processData.status === 'in_progress' ? 'En Progreso' : 'Pendiente'}
                </Badge>
                <Badge variant={
                  processData.metadata?.priority === 'high' ? 'destructive' :
                  processData.metadata?.priority === 'medium' ? 'secondary' : 'outline'
                }>
                  {processData.metadata?.priority === 'high' ? 'Alta Prioridad' :
                   processData.metadata?.priority === 'medium' ? 'Prioridad Media' : 'Baja Prioridad'}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowChat(!showChat)}
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Chat IA
              </Button>
              <Button
                onClick={() => generateDocumentMutation.mutate()}
                disabled={generateDocumentMutation.isPending}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {generateDocumentMutation.isPending ? 'Generando...' : 'Generar Documento'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-neutral-700">Progreso del Proceso</Label>
              <Progress value={processData.progress} className="mt-2 h-2" />
              <p className="text-sm text-neutral-500 mt-1">
                {processData.progress}% completado
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case Information */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
              <FileText className="h-5 w-5" />
              Información del Caso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-neutral-700">Número de Caso</Label>
              <Input
                value={processData.metadata?.caseNumber || ''}
                onChange={(e) => {
                  const metadata = { ...(processData.metadata || {}), caseNumber: e.target.value };
                  updateProcessMutation.mutate({ metadata });
                }}
                placeholder="Ingrese número de caso"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-neutral-700">Tribunal</Label>
              <Input
                value={processData.metadata?.court || ''}
                onChange={(e) => {
                  const metadata = { ...(processData.metadata || {}), court: e.target.value };
                  updateProcessMutation.mutate({ metadata });
                }}
                placeholder="Tribunal competente"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-neutral-700">Juez</Label>
              <Input
                value={processData.metadata?.judge || ''}
                onChange={(e) => {
                  const metadata = { ...(processData.metadata || {}), judge: e.target.value };
                  updateProcessMutation.mutate({ metadata });
                }}
                placeholder="Nombre del juez"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-neutral-700">Parte Contraria</Label>
              <Input
                value={processData.metadata?.opposingParty || ''}
                onChange={(e) => {
                  const metadata = { ...(processData.metadata || {}), opposingParty: e.target.value };
                  updateProcessMutation.mutate({ metadata });
                }}
                placeholder="Nombre de la parte contraria"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-neutral-700">Monto</Label>
              <Input
                value={processData.metadata?.amount || ''}
                onChange={(e) => {
                  const metadata = { ...(processData.metadata || {}), amount: e.target.value };
                  updateProcessMutation.mutate({ metadata });
                }}
                placeholder="Monto en disputa"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-neutral-700">Fecha Límite</Label>
              <Input
                type="date"
                value={processData.metadata?.deadline || ''}
                onChange={(e) => {
                  const metadata = { ...(processData.metadata || {}), deadline: e.target.value };
                  updateProcessMutation.mutate({ metadata });
                }}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Legal Basis */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
              <FileText className="h-5 w-5" />
              Base Legal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-neutral-700">Fundamento Legal</Label>
                  <div 
                    className="mt-1 p-4 border rounded-md bg-white min-h-[200px] prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: processData.legalBasis || '' }}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-neutral-700">Artículos Constitucionales</Label>
                  <div className="mt-2 space-y-2">
                    {(processData.constitutionalArticles || []).map((article, index) => (
                      <Badge key={index} variant="outline" className="block p-2 text-sm">
                        {article}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Steps */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
              <CheckCircle className="h-5 w-5" />
              Pasos del Proceso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {processData.steps.map((step, index) => (
                  <div key={step.id} className="flex items-start gap-4">
                    <Checkbox
                      checked={step.completed}
                      onCheckedChange={(checked) => {
                        toggleStepMutation.mutate({
                          stepId: step.id,
                          completed: checked as boolean
                        });
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-neutral-900">{step.title}</h4>
                        {step.dueDate && (
                          <span className="text-sm text-neutral-500">
                            {new Date(step.dueDate).toLocaleDateString('es-ES')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-500">{step.description}</p>
                      {step.documents.length > 0 && (
                        <div className="mt-2">
                          <Label className="text-xs font-medium text-neutral-700">Documentos Requeridos</Label>
                          <ul className="mt-1 space-y-1">
                            {step.documents.map((doc, i) => (
                              <li key={i} className="text-sm text-neutral-500 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                {doc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      {showChat && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-neutral-900">
              <MessageCircle className="h-5 w-5" />
              Asistente Legal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChatInterface processId={processId} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}