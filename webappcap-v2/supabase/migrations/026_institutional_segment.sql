-- Add the institutional category without changing publication or existing projects.
alter table public.project_v2_state drop constraint if exists project_v2_state_segment_check;
alter table public.project_v2_state add constraint project_v2_state_segment_check
  check (segment in ('portfolio','personal-trainer','food-business','commerce','school','institutional'));
