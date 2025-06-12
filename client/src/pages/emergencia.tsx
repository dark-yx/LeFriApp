import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Edit, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Navbar } from '@/components/navbar';
import { EmergencyButton } from '@/components/emergency-button';
import { api } from '@/lib/api';
import { EditContactDialog } from '@/components/edit-contact-dialog';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from '@/contexts/translations';

const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Phone must have at least 10 digits'),
  relationship: z.string().min(1, 'Relationship is required'),
  whatsappEnabled: z.boolean().default(true),
});

type EmergencyContactForm = z.infer<typeof emergencyContactSchema>;

export default function Emergencia() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);

  const { data: emergencyContacts } = useQuery({
    queryKey: ['/api/emergency-contacts'],
    queryFn: async () => {
      const response = await api.getEmergencyContacts();
      return await response.json();
    },
  });

  const createContactMutation = useMutation({
    mutationFn: api.createEmergencyContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emergency-contacts'] });
      setIsAddingContact(false);
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: api.deleteEmergencyContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emergency-contacts'] });
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EmergencyContactForm>({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: {
      whatsappEnabled: true,
    },
  });

  const onSubmit = async (data: EmergencyContactForm) => {
    try {
      await createContactMutation.mutateAsync(data);
    } catch (error) {
      console.error('Error creating contact:', error);
    }
  };

  const handleDeleteContact = async (id: number) => {
    try {
      await deleteContactMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
    ];
    return colors[index % colors.length];
  };

  const relationships = [
    { value: 'mother', label: t('relationship.mother') },
    { value: 'father', label: t('relationship.father') },
    { value: 'sibling', label: t('relationship.sibling') },
    { value: 'partner', label: t('relationship.partner') },
    { value: 'lawyer', label: t('relationship.lawyer') },
    { value: 'friend', label: t('relationship.friend') },
    { value: 'other', label: t('relationship.other') },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/dashboard')}
              className="p-2 hover:bg-neutral-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-600" />
            </Button>
            <h1 className="text-2xl font-bold text-neutral-900">{t('emergency')}</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Emergency Button */}
            <EmergencyButton />

            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{t('emergencyContacts')}</CardTitle>
                  <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-500 hover:bg-blue-600">
                        <Plus className="w-4 h-4 mr-2" />
                        {t('addContact')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('addEmergencyContact')}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                          <Label htmlFor="name">{t('contactName')}</Label>
                          <Input
                            id="name"
                            {...register('name')}
                            className="mt-1"
                          />
                          {errors.name && (
                            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="phone">{t('phoneNumber')}</Label>
                          <Input
                            id="phone"
                            {...register('phone')}
                            className="mt-1"
                          />
                          {errors.phone && (
                            <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="relationship">{t('relationship')}</Label>
                          <Select
                            onValueChange={(value) => setValue('relationship', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder={t('selectRelationship')} />
                            </SelectTrigger>
                            <SelectContent>
                              {relationships.map((rel) => (
                                <SelectItem key={rel.value} value={rel.value}>
                                  {rel.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.relationship && (
                            <p className="text-sm text-red-500 mt-1">{errors.relationship.message}</p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="whatsapp"
                            {...register('whatsappEnabled')}
                          />
                          <Label htmlFor="whatsapp">{t('notifyViaWhatsApp')}</Label>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsAddingContact(false)}
                          >
                            {t('cancel')}
                          </Button>
                          <Button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-600"
                            disabled={createContactMutation.isPending}
                          >
                            {createContactMutation.isPending ? t('saving') : t('save')}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {emergencyContacts?.length > 0 ? (
                    emergencyContacts.map((contact: any, index: number) => (
                      <div key={contact._id || contact.id || `contact-${index}`} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className={`${getAvatarColor(index)} text-white text-xs font-medium`}>
                              {getInitials(contact.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-neutral-900">{contact.name}</p>
                            <p className="text-xs text-neutral-500">
                              {relationships.find(r => r.value === contact.relationship)?.label || contact.relationship} • {contact.phone}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingContact(contact)}
                            className="text-neutral-600 hover:text-neutral-900"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteContact(contact._id || contact.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <Alert>
                      <AlertDescription>
                        {t('noEmergencyContacts')}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Edit Contact Dialog */}
      <EditContactDialog
        contact={editingContact}
        isOpen={!!editingContact}
        onClose={() => setEditingContact(null)}
      />
    </div>
  );
}
