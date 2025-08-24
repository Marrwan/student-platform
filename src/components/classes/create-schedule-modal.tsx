'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface CreateScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  className: string;
  onScheduleCreated: () => void;
}

export function CreateScheduleModal({
  open,
  onOpenChange,
  classId,
  className,
  onScheduleCreated
}: CreateScheduleModalProps) {
  const [loading, setLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    dayOfWeek: 'monday',
    startTime: '',
    endTime: '',
    type: 'virtual' as 'virtual' | 'physical',
    location: '',
    meetingLink: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.createClassSchedule({
        ...scheduleData,
        classId
      });
      
      toast.success('Schedule added successfully!');
      onOpenChange(false);
      
      // Reset form
      setScheduleData({
        dayOfWeek: 'monday',
        startTime: '',
        endTime: '',
        type: 'virtual',
        location: '',
        meetingLink: ''
      });
      
      onScheduleCreated();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Class Schedule</DialogTitle>
          <DialogDescription>
            Add a new schedule entry for {className}.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dayOfWeek">Day of Week</Label>
              <Select 
                value={scheduleData.dayOfWeek} 
                onValueChange={(value) => setScheduleData(prev => ({ ...prev, dayOfWeek: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="tuesday">Tuesday</SelectItem>
                  <SelectItem value="wednesday">Wednesday</SelectItem>
                  <SelectItem value="thursday">Thursday</SelectItem>
                  <SelectItem value="friday">Friday</SelectItem>
                  <SelectItem value="saturday">Saturday</SelectItem>
                  <SelectItem value="sunday">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="type">Type</Label>
              <Select 
                value={scheduleData.type} 
                onValueChange={(value: 'virtual' | 'physical') => setScheduleData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="virtual">Virtual</SelectItem>
                  <SelectItem value="physical">Physical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={scheduleData.startTime}
                onChange={(e) => setScheduleData(prev => ({ ...prev, startTime: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={scheduleData.endTime}
                onChange={(e) => setScheduleData(prev => ({ ...prev, endTime: e.target.value }))}
                required
              />
            </div>
          </div>
          
          {scheduleData.type === 'virtual' ? (
            <div>
              <Label htmlFor="meetingLink">Meeting Link</Label>
              <Input
                id="meetingLink"
                type="url"
                value={scheduleData.meetingLink}
                onChange={(e) => setScheduleData(prev => ({ ...prev, meetingLink: e.target.value }))}
                placeholder="https://meet.google.com/..."
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={scheduleData.location}
                onChange={(e) => setScheduleData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Room 101, Building A"
              />
            </div>
          )}
        </form>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
